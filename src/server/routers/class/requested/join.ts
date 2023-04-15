import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { User } from "@prisma/client";

import { protectedProcedure } from "@/server/trpc";
import { z } from "zod";
export const join = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    const user = ctx.session?.user as User;

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
      await txn.userOnBookingTimeSlots.create({
        data: {
          userId: user.id,
          bookingTimeSlotId: id,
        },
      });
    });
  });
