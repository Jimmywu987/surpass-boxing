import { NotificationEnums } from "@/features/common/enums/NotificationEnums";
import { getFormatTimeZone, getZonedStartOfDay } from "@/helpers/getTimeZone";
import { sendEmail } from "@/services/nodemailer";
import { prisma } from "@/services/prisma";
import {
  BookingTimeSlotStatusEnum,
  LanguageEnum,
  Lessons,
} from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getMessage } from "@/services/notification/getMessage";
import { getTimeDuration } from "@/helpers/getTime";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const authHeader = request.headers["authorization"];
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return response.status(401).json({ success: false });
  }
  const now = new Date();
  const past = getZonedStartOfDay(now);
  await prisma.cancelRegularBookingTimeSlot.deleteMany({
    where: {
      date: {
        lt: past,
      },
    },
  });
  await prisma.offDay.deleteMany({
    where: {
      date: {
        lt: past,
      },
    },
  });
  await prisma.bookingTimeSlots.deleteMany({
    where: {
      date: {
        lt: past,
      },
      status: BookingTimeSlotStatusEnum.PENDING,
      userOnBookingTimeSlots: {
        every: {
          userId: {
            in: [],
          },
        },
      },
    },
  });
  const pendingTimeSlots = await prisma.bookingTimeSlots.findMany({
    where: {
      date: {
        lt: past,
      },
      status: BookingTimeSlotStatusEnum.PENDING,
    },
    include: {
      userOnBookingTimeSlots: true,
    },
  });

  for (let i = 0; i < pendingTimeSlots.length; i++) {
    const timeSlot = pendingTimeSlots[i];
    const joinedMembers = timeSlot.userOnBookingTimeSlots;
    const userIds = joinedMembers.map((each) => each.userId);
    const uniqueLessons: Lessons[] = [];
    const lessonIds: string[] = [];
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
            id: timeSlot.id,
          },
          data: {
            status: BookingTimeSlotStatusEnum.CANCELED,
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
      messageKey: NotificationEnums.CLASS_CANCELLED,
      lang: LanguageEnum.EN,
    });
    const messageInZh = getMessage({
      data: messageData,
      messageKey: NotificationEnums.CLASS_CANCELLED,
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
  }

  return response.status(200).end("done!");
}
