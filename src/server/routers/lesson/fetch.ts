import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

export const fetch = protectedProcedure.query(async ({ ctx }) => {
  const user = ctx.session.user as User;
  const selectedDate = new Date();
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
      lesson: {
        gt: 0,
      },
    },
  });

  return { lessons, classes };
});
