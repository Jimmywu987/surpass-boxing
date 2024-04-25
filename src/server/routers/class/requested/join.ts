import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { getMessage } from "@/services/notification/getMessage";
import { LanguageEnum, User } from "@prisma/client";

import { NotificationEnums } from "@/features/common/enums/NotificationEnums";
import { getTimeDuration } from "@/helpers/getTime";
import { getFormatTimeZone } from "@/helpers/getTimeZone";
import { protectedProcedure } from "@/server/trpc";
import { getTranslatedTerm } from "@/services/notification/getTranslatedTerm";

import { z } from "zod";
import { sendEmail } from "@/services/nodemailer";
import { endOfDay, startOfDay } from "date-fns";
export const join = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      selectedDateInString: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, selectedDateInString } = input;

    const user = ctx.session?.user as User;

    const { username } = user;
    const selectedDate = new Date(selectedDateInString);
    const startOfSelectedDate = endOfDay(selectedDate);

    const endOfSelectedDate = startOfDay(selectedDate);
    const lessons = await prisma.lessons.findMany({
      where: {
        userId: user.id,
        expiryDate: {
          gte: endOfSelectedDate,
        },
        startDate: {
          lte: startOfSelectedDate,
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
    const bookingTimeSlots = await prisma.bookingTimeSlots.findUnique({
      where: {
        id,
      },
      include: {
        coach: true,
      },
    });

    if (!bookingTimeSlots) {
      throw new TRPCError({
        code: "BAD_REQUEST",
      });
    }
    const classLevel = lessons.find(
      (lesson) => lesson.level === bookingTimeSlots.level
    );

    await prisma.$transaction(async (txn) => {
      await txn.lessons.update({
        data: {
          lesson: {
            decrement: 1,
          },
        },
        where: {
          id: classLevel ? classLevel.id : lessons[0].id,
        },
      });

      await txn.userOnBookingTimeSlots.create({
        data: {
          userId: user.id,
          bookingTimeSlotId: id,
        },
      });

      if (!classLevel) {
        await txn.classLevelDifferentRecord.create({
          data: {
            userId: user.id,
            bookingTimeSlotId: id,
            levelFrom: lessons[0].level,
            levelTo: bookingTimeSlots.level,
          },
        });
      }
    });

    const { className, startTime, endTime, date, coachId, level } =
      bookingTimeSlots;

    const admins = await prisma.user.findMany({
      where: coachId
        ? { id: coachId }
        : {
            admin: true,
          },
    });

    const dateTime = getFormatTimeZone({ date: date });
    const time = getTimeDuration({ startTime, endTime });

    const url = `admin?time_slot_id=${id}&date=${dateTime}`;

    await Promise.all(
      admins.map(async (admin, index) => {
        const lang = admin.lang === LanguageEnum.EN ? "en" : "zh-HK";
        const messageData = classLevel
          ? {
              username,
              dateTime,
              time,
              className,
            }
          : {
              username,
              dateTime,
              time,
              className,
              levelFrom: getTranslatedTerm(lessons[0].level, lang),
              levelTo: getTranslatedTerm(level, lang),
            };
        const message = getMessage({
          data: messageData,
          messageKey: classLevel
            ? NotificationEnums.JOIN_CLASS
            : NotificationEnums.JOIN_DIFFERENT_CLASS,
          lang: admin.lang,
        });
        await sendEmail(admin.email, message, url);

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
