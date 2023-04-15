import { prisma } from "@/services/prisma";
import { BookingTimeSlotStatusEnum, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { add, isAfter } from "date-fns";

import { protectedProcedure } from "@/server/trpc";
import { z } from "zod";

export const leave = protectedProcedure
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
    const { id, status } = input;
    const user = ctx.session?.user as User;

    let shouldAddBackLesson = true;

    if (status === BookingTimeSlotStatusEnum.CONFIRM) {
      const bookingTimeSlot = await prisma.userOnBookingTimeSlots.findUnique({
        where: {
          userId_bookingTimeSlotId: {
            userId: user.id,
            bookingTimeSlotId: id,
          },
        },
      });
      if (!bookingTimeSlot) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      const joiningTime = new Date(bookingTimeSlot.createdAt);
      const now = new Date();

      if (isAfter(now, add(joiningTime, { hours: 1 }))) {
        shouldAddBackLesson = false;
      }
    }
    await prisma.$transaction(async (txn) => {
      if (shouldAddBackLesson) {
        const lessons = await txn.lessons.findMany({
          where: {
            userId: user.id,
            expiryDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            expiryDate: "asc",
          },
        });

        if (lessons.length !== 0) {
          await txn.lessons.update({
            data: {
              lesson: {
                increment: 1,
              },
            },
            where: {
              id: lessons[0].id,
            },
          });
        }
      }

      await txn.userOnBookingTimeSlots.delete({
        where: {
          userId_bookingTimeSlotId: {
            userId: user.id,
            bookingTimeSlotId: id,
          },
        },
      });
    });
  });
