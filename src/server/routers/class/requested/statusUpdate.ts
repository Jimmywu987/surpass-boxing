import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "@/server/trpc";
import { BookingTimeSlotStatusEnum, Lessons, User } from "@prisma/client";
import { z } from "zod";
export const statusUpdate = protectedProcedure
  .input(
    z.object({
      status: z.enum([
        BookingTimeSlotStatusEnum.CANCELED,
        BookingTimeSlotStatusEnum.CONFIRM,
        BookingTimeSlotStatusEnum.PENDING,
      ]),
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { status, id } = input;
    const user = ctx.session?.user as User;
    if (!user.admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    const lessonIds: string[] = [];

    if (status === BookingTimeSlotStatusEnum.CANCELED) {
      const timeSlots = await prisma.userOnBookingTimeSlots.findMany({
        where: {
          bookingTimeSlotId: id,
        },
      });
      const userIds = timeSlots.map((timeSlot) => timeSlot.userId);
      const uniqueLessons: Lessons[] = [];
      const lessons = await prisma.lessons.findMany({
        where: {
          userId: { in: userIds },
          expiryDate: {
            gte: new Date(),
          },
        },
        orderBy: {
          expiryDate: "asc",
        },
      });
      for (const lesson of lessons) {
        const isDuplicate = uniqueLessons.find(
          (each) => each.userId === lesson.userId
        );
        if (!isDuplicate) {
          uniqueLessons.push(lesson);
          lessonIds.push(lesson.id);
        }
      }
    }
    //@TODO: send messages to users
    return prisma.$transaction(async (txn) => {
      if (lessonIds.length > 0) {
        await txn.lessons.updateMany({
          data: {
            lesson: {
              increment: 1,
            },
          },
          where: {
            id: { in: lessonIds },
          },
        });
      }

      return await txn.bookingTimeSlots.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });
    });
  });
