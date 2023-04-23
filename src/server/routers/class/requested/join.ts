import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { LanguageEnum, User } from "@prisma/client";

import { protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { sendNotification } from "@/services/onesignal";
import { format } from "date-fns";
import { getTimeDuration } from "@/helpers/getTime";
export const join = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    const user = ctx.session?.user as User;

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
          bookingTimeSlots: true,
        },
      });
    });
    const { className, startTime, endTime, date } = result.bookingTimeSlots;

    const admins = await prisma.user.findMany({
      where: {
        admin: true,
      },
    });

    await Promise.all(
      admins.map(async (admin) => {
        const dateTime = format(date, "dd/MM/yyyy");
        const time = getTimeDuration({ startTime, endTime });
        const message =
          admin.lang === LanguageEnum.EN
            ? `${user.username} has joined a ${className} on ${dateTime}: ${time}`
            : `${user.username}已加入${dateTime}: ${time}的${className}課堂`;

        await sendNotification({
          message,
          lang: admin.lang,
          externalId: admin.id,
        });
      })
    );
  });
