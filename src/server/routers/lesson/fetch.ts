import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

export const fetch = protectedProcedure
  .input(
    z.object({
      date: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { date } = input;
    const user = ctx.session.user as User;
    const selectedDate = new Date(date);
    const startOfSelectedDate = endOfDay(selectedDate);

    const endOfSelectedDate = startOfDay(selectedDate);

    const classes = await prisma.userOnBookingTimeSlots.findMany({
      where: {
        userId: user.id,
        bookingTimeSlots: {
          date: {
            gte: startOfSelectedDate,
          },
        },
      },
    });
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
    });

    return { lessons, classes };
  });
