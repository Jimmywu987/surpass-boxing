import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { LanguageEnum, User } from "@prisma/client";
import { z } from "zod";
import { format } from "date-fns";
import { getTimeDuration } from "@/helpers/getTime";
import { sendSingleNotification } from "@/services/notification/onesignal";
import { getMessage } from "@/services/notification/getMessage";
import { NotificationEnums } from "@/features/common/enums/NotificationEnums";

import { getTranslatedTerm } from "@/services/notification/getTranslatedTerm";

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
    const { username } = user;
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
    const {
      startTime,
      endTime,
      className,
      numberOfParticipants,
      coach,
      level,
    } = regularBookingSlot;

    const classLevel = lessons.find((lesson) => lesson.level === level);
    const result = await prisma.$transaction(async (txn) => {
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

      const { id } = regularBookingSlot;

      const result = await txn.bookingTimeSlots.create({
        data: {
          date: new Date(date),
          startTime,
          endTime,
          className,
          level,
          coachId: coach?.id ?? null,
          numberOfParticipants,
          regularBookingTimeSlotId: id,
          userOnBookingTimeSlots: {
            create: {
              userId: user.id,
            },
          },
        },
      });

      if (!classLevel) {
        await txn.classLevelDifferentRecord.create({
          data: {
            userId: user.id,
            levelFrom: lessons[0].level,
            levelTo: level,
            bookingTimeSlotId: result.id,
          },
        });
      }
      return result;
    });

    const admins = await prisma.user.findMany({
      where: coach?.id
        ? {
            id: coach.id,
          }
        : {
            admin: true,
          },
    });
    const dateTime = format(new Date(date), "yyyy-MM-dd");
    const time = getTimeDuration({ startTime, endTime });
    const url = `admin?time_slot_id=${result.id}&date=${dateTime}`;

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
        await sendSingleNotification({
          receiver: admin,
          url,
          message,
        });
        if (index === 0) {
          await prisma.notification.create({
            data: {
              url,
              message,
              adminId: coach?.id ? coach?.id : null,
            },
          });
        }
      })
    );
  });
