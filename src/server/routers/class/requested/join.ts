import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { LanguageEnum, User } from "@prisma/client";

import { protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { sendSingleNotification } from "@/services/notification/onesignal";
import { format } from "date-fns";
import { getTimeDuration } from "@/helpers/getTime";
import { NotificationEnums } from "@/features/common/enums/NotificationEnums";
export const join = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    const user = ctx.session?.user as User;
    const { username } = user;
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
    const result = await prisma.$transaction(async (txn) => {
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
      return await txn.userOnBookingTimeSlots.create({
        data: {
          userId: user.id,
          bookingTimeSlotId: id,
        },
        include: {
          bookingTimeSlots: {
            include: {
              coach: true,
            },
          },
        },
      });
    });
    const { className, startTime, endTime, date, coachId } =
      result.bookingTimeSlots;

    const admins = await prisma.user.findMany({
      where: coachId
        ? { id: coachId }
        : {
            admin: true,
          },
    });
    const dateTime = format(date, "yyyy-MM-dd");
    const time = getTimeDuration({ startTime, endTime });

    const url = `admin?time_slot_id=${id}&date=${dateTime}`;

    await Promise.all(
      admins.map(async (admin, index) => {
        const message = await sendSingleNotification({
          data: {
            username,
            dateTime,
            time,
            className,
          },
          messageKey: NotificationEnums.JOIN_CLASS,
          receiver: admin,
          url,
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
