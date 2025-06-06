import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { NotificationEnums } from "@/features/common/enums/NotificationEnums";
import { getTimeDuration } from "@/helpers/getTime";
import { getFormatTimeZone } from "@/helpers/getTimeZone";
import { protectedProcedure } from "@/server/trpc";
import { getMessage } from "@/services/notification/getMessage";

import {
  BookingTimeSlotStatusEnum,
  LanguageEnum,
  Lessons,
  User,
} from "@prisma/client";
import { z } from "zod";
import { sendEmail } from "@/services/nodemailer";
export const resumeClass = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
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

    const bookingTimeSlot = await prisma.$transaction(
      async (txn) => {
        if (lessonIds.length > 0) {
          await txn.lessons.updateMany({
            data: {
              lesson: {
                decrement: 1,
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
            status: BookingTimeSlotStatusEnum.PENDING,
          },
          include: {
            userOnBookingTimeSlots: {
              include: {
                user: {
                  select: {
                    id: true,
                    lang: true,
                    email: true,
                  },
                },
              },
            },
          },
        });
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 10000, // default: 5000
      }
    );

    const { date, startTime, endTime, className, userOnBookingTimeSlots } =
      bookingTimeSlot;
    const userForZh = userOnBookingTimeSlots
      .filter((timeSlot) => timeSlot.user.lang === LanguageEnum.ZH)
      .map((timeSlot) => timeSlot.user);
    const userForEn = userOnBookingTimeSlots
      .filter((timeSlot) => timeSlot.user.lang === LanguageEnum.EN)
      .map((timeSlot) => timeSlot.user);
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
      messageKey: NotificationEnums.CLASS_PENDING,
      lang: LanguageEnum.EN,
    });
    const messageInZh = getMessage({
      data: messageData,
      messageKey: NotificationEnums.CLASS_PENDING,
      lang: LanguageEnum.ZH,
    });

    await Promise.all(
      userForZh.map((user) => {
        return sendEmail(user.email, messageInZh, url);
      })
    );
    await Promise.all(
      userForEn.map((user) => {
        return sendEmail(user.email, messageInEn, url);
      })
    );

    return bookingTimeSlot;
  });
