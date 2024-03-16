import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { NotificationEnums } from "@/features/common/enums/NotificationEnums";
import { getTimeDuration } from "@/helpers/getTime";
import { getFormatTimeZone } from "@/helpers/getTimeZone";
import { protectedProcedure } from "@/server/trpc";
import { getMessage } from "@/services/notification/getMessage";
import { sendSingleNotification } from "@/services/notification/onesignal";
import {
  BookingTimeSlotStatusEnum,
  LanguageEnum,
  Lessons,
  User,
} from "@prisma/client";
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
    const timeSlots = await prisma.userOnBookingTimeSlots.findMany({
      where: {
        bookingTimeSlotId: id,
      },
    });
    const userIds = timeSlots.map((timeSlot) => timeSlot.userId);
    const isCancelled = status === BookingTimeSlotStatusEnum.CANCELED;
    if (isCancelled) {
      const now = new Date();
      const uniqueLessons: Lessons[] = [];
      const lessons = await prisma.lessons.findMany({
        where: {
          userId: { in: userIds },
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

    const bookingTimeSlot = await prisma.$transaction(async (txn) => {
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
        include: {
          userOnBookingTimeSlots: {
            include: {
              user: {
                select: {
                  id: true,
                  lang: true,
                },
              },
            },
          },
        },
      });
    });

    const { date, startTime, endTime, className, userOnBookingTimeSlots } =
      bookingTimeSlot;
    const userIdsForZh = userOnBookingTimeSlots
      .filter((timeSlot) => timeSlot.user.lang === LanguageEnum.ZH)
      .map((timeSlot) => timeSlot.user.id);
    const userIdsForEn = userOnBookingTimeSlots
      .filter((timeSlot) => timeSlot.user.lang === LanguageEnum.EN)
      .map((timeSlot) => timeSlot.user.id);
    const dateTime = getFormatTimeZone({
      date: new Date(date),
    });
    const time = getTimeDuration({ startTime, endTime });
    const url = `classes?date=${dateTime}`;
    const messageData = {
      dateTime,
      time,
      className,
    };
    const messageInEn = getMessage({
      data: messageData,
      messageKey: isCancelled
        ? NotificationEnums.CLASS_CANCELLED
        : NotificationEnums.CLASS_CONFIRMED,
      lang: LanguageEnum.EN,
    });
    const messageInZh = getMessage({
      data: messageData,
      messageKey: isCancelled
        ? NotificationEnums.CLASS_CANCELLED
        : NotificationEnums.CLASS_CONFIRMED,
      lang: LanguageEnum.ZH,
    });

    await sendSingleNotification({
      receiverIds: userIdsForZh,
      url,
      message: messageInZh,
    });
    await sendSingleNotification({
      receiverIds: userIdsForEn,
      url,
      message: messageInEn,
    });
    return bookingTimeSlot;
  });
