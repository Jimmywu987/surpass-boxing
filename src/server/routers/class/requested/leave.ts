import { prisma } from "@/services/prisma";
import { BookingTimeSlotStatusEnum, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { add, isAfter } from "date-fns";

import { NotificationEnums } from "@/features/common/enums/NotificationEnums";
import { getTimeDuration } from "@/helpers/getTime";
import { getFormatTimeZone } from "@/helpers/getTimeZone";
import { protectedProcedure } from "@/server/trpc";
import { getMessage } from "@/services/notification/getMessage";
import { sendSingleNotification } from "@/services/notification/onesignal";
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
    const userBookingTimeSlot = await prisma.userOnBookingTimeSlots.findUnique({
      where: {
        userId_bookingTimeSlotId: {
          userId: user.id,
          bookingTimeSlotId: id,
        },
      },
    });
    if (!userBookingTimeSlot) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    const now = new Date();
    if (status === BookingTimeSlotStatusEnum.CONFIRM) {
      const joiningTime = new Date(userBookingTimeSlot.createdAt);

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
              gte: now,
            },
            startDate: {
              lte: now,
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
    const bookingTimeSlot = await prisma.bookingTimeSlots.findUnique({
      where: {
        id,
      },
    });
    if (!bookingTimeSlot) {
      return;
    }
    const { startTime, date, endTime, coachId, className } = bookingTimeSlot;
    const admins = await prisma.user.findMany({
      where: coachId
        ? { id: coachId }
        : {
            admin: true,
          },
    });
    const dateTime = getFormatTimeZone({
      date: new Date(date),
    });
    const time = getTimeDuration({ startTime, endTime });
    const url = `admin?time_slot_id=${id}&date=${dateTime}`;

    await Promise.all(
      admins.map(async (admin, index) => {
        const messageData = {
          username: user.username,
          dateTime,
          time,
          className,
        };
        const message = getMessage({
          data: messageData,
          messageKey: NotificationEnums.LEAVE_CLASS,
          lang: admin.lang,
        });
        await sendSingleNotification({
          receiverIds: [admin.id],
          url,
          message,
        });
        if (index === 0) {
          await prisma.notification.create({
            data: {
              url,
              message,
              adminId: coachId ? coachId : null,
            },
          });
        }
      })
    );
  });
