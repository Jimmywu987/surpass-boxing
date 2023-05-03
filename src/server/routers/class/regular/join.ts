import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { User } from "@prisma/client";
import { z } from "zod";
import { format } from "date-fns";
import { getTimeDuration } from "@/helpers/getTime";
import { sendSingleNotification } from "@/services/notification/onesignal";
import { NotificationEnums } from "@/features/common/enums/NotificationEnums";

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
    const { startTime, endTime, className, numberOfParticipants, coach } =
      regularBookingSlot;
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

      const { id } = regularBookingSlot;
      return await txn.bookingTimeSlots.create({
        data: {
          date: new Date(date),
          startTime,
          endTime,
          className,
          coachName: coach?.username ?? null,
          numberOfParticipants,
          regularBookingTimeSlotId: id,
          userOnBookingTimeSlots: {
            create: {
              userId: user.id,
            },
          },
        },
      });
    });
    const admins = await prisma.user.findMany({
      where: {
        admin: true,
      },
    });
    const dateTime = format(new Date(date), "yyyy-MM-dd");
    const time = getTimeDuration({ startTime, endTime });

    await Promise.all(
      admins.map(async (admin) => {
        await sendSingleNotification({
          data: {
            username,
            dateTime,
            time,
            className,
          },
          messageKey: NotificationEnums.JOIN_CLASS,
          receiver: admin,
          url: `admin?time_slot_id=${result.id}&date=${dateTime}`,
        });
      })
    );
  });
