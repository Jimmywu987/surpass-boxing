import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { User } from "@prisma/client";
import { z } from "zod";

export const join = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      date: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, date } = input;
    const user = ctx.session?.user as User;

    const regularBookingSlot = await prisma.regularBookingTimeSlots.findFirst({
      where: {
        id,
      },
      include: {
        coach: true,
      },
    });
    if (!regularBookingSlot) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }
    const lessons = await prisma.lessons.findMany({
      where: {
        userId: user.id,
        expiryDate: {
          gte: new Date(),
        },
        lesson: {
          gt: 0,
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    if (lessons.length === 0) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    await prisma.$transaction(async (txn) => {
      await txn.lessons.update({
        data: {
          lesson: {
            decrement: 1,
          },
        },
        where: {
          id: lessons[0].id,
        },
      });
      const { startTime, endTime, className, numberOfParticipants, id, coach } =
        regularBookingSlot;

      await txn.bookingTimeSlots.create({
        data: {
          date: new Date(date),
          startTime,
          endTime,
          className,
          coachName: coach?.username ?? null,
          numberOfParticipants,
          regularBookingTimeSlotId: id,
          userOnBookingTimeSlots: {
            create: {
              userId: user.id,
            },
          },
        },
      });
    });
  });
