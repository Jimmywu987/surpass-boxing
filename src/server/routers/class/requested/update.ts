import { NotificationEnums } from "@/features/common/enums/NotificationEnums";
import { getTimeDuration } from "@/helpers/getTime";
import { getFormatTimeZone } from "@/helpers/getTimeZone";
import { requestedClassCreateSchema } from "@/schemas/class/requested/create";
import { protectedProcedure } from "@/server/trpc";
import { getMessage } from "@/services/notification/getMessage";
import { sendWebPushSingleNotification } from "@/services/notification/onesignal";
import { prisma } from "@/services/prisma";
import { LanguageEnum, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const update = protectedProcedure
  .input(requestedClassCreateSchema)
  .mutation(async ({ ctx, input }) => {
    const { setLimit, people, date, ...data } = input;
    const dateTime = new Date(date);
    const user = ctx.session?.user as User;
    if (!user.admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    let regularBookingTimeSlotId = null;

    const weekday = getFormatTimeZone({
      date: dateTime,
      format: "EEEE",
    }).toLowerCase();

    let hasCoachName = {};
    if (data.coachId) {
      hasCoachName = {
        coach: {
          id: data.coachId,
        },
      };
    }
    const regularBookingSlot = await prisma.regularBookingTimeSlots.findFirst({
      where: {
        [weekday]: true,
        startTime: data.startTime,
        endTime: data.endTime,
        className: data.className,
        ...hasCoachName,
      },
    });
    if (regularBookingSlot) {
      regularBookingTimeSlotId = regularBookingSlot.id;
    }
    const bookingTimeSlot = await prisma.bookingTimeSlots.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!bookingTimeSlot) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Booking time slot class not found",
      });
    }

    const updatedBookingTimeSlot = await prisma.bookingTimeSlots.update({
      where: {
        id: data.id,
      },
      data: {
        date: dateTime,
        startTime: data.startTime,
        endTime: data.endTime,
        className: data.className,
        level: data.level,
        coachId: !!data.coachId ? data.coachId : null,
        numberOfParticipants: setLimit ? people : null,
        regularBookingTimeSlotId,
      },
      include: {
        userOnBookingTimeSlots: {
          include: {
            user: {
              select: {
                id: true,
                lang: true,
                pushNotification: true,
              },
            },
          },
        },
      },
    });
    if (
      data.startTime !== bookingTimeSlot.startTime ||
      bookingTimeSlot.endTime !== data.endTime
    ) {
      const { userOnBookingTimeSlots } = updatedBookingTimeSlot;
      const userIdsForZh = userOnBookingTimeSlots
        .filter((timeSlot) => timeSlot.user.lang === LanguageEnum.ZH)
        .map((timeSlot) => timeSlot.user.pushNotification);
      const userIdsForEn = userOnBookingTimeSlots
        .filter((timeSlot) => timeSlot.user.lang === LanguageEnum.EN)
        .map((timeSlot) => timeSlot.user.pushNotification);

      const {
        date: timeSlotDate,
        startTime,
        endTime,
        className,
      } = bookingTimeSlot;

      const formattedDateTime = getFormatTimeZone({
        date: new Date(timeSlotDate),
        format: "yyyy-MM-dd",
      });
      const time = getTimeDuration({ startTime, endTime });
      const updatedTime = getTimeDuration({
        startTime: data.startTime,
        endTime: data.endTime,
      });
      const url = `classes?date=${formattedDateTime}`;
      const messageData = {
        dateTime: formattedDateTime,
        time,
        className,
        updatedTime,
      };
      const messageInEn = getMessage({
        data: messageData,
        messageKey: NotificationEnums.CLASS_UPDATED,
        lang: LanguageEnum.EN,
      });
      const messageInZh = getMessage({
        data: messageData,
        messageKey: NotificationEnums.CLASS_UPDATED,
        lang: LanguageEnum.ZH,
      });
      if (userIdsForZh.length > 0) {
        for (let i = 0; i < userIdsForZh.length; i++) {
          const each = userIdsForZh[i] as any;
          if (each) {
            const result = each.subscription
              .map((each: any) => {
                return sendWebPushSingleNotification({
                  subscription: each,
                  data: {
                    title: "Surpass boxing",
                    body: messageInZh,
                    url,
                  },
                });
              })
              .flat();
            await Promise.all(result);
          }
        }
      }
      if (userIdsForEn.length > 0) {
        for (let i = 0; i < userIdsForEn.length; i++) {
          const each = userIdsForEn[i] as any;
          if (each) {
            const result = each.subscription
              .map((each: any) => {
                return sendWebPushSingleNotification({
                  subscription: each,
                  data: {
                    title: "Surpass boxing",
                    body: messageInEn,
                    url,
                  },
                });
              })
              .flat();
            await Promise.all(result);
          }
        }
      }

      // await sendSingleNotification({
      //   receiverIds: userIdsForZh,
      //   url,
      //   message: messageInZh,
      // });
      // await sendSingleNotification({
      //   receiverIds: userIdsForEn,
      //   url,
      //   message: messageInEn,
      // });
    }
  });
