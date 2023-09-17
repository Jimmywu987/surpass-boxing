import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";

export const fetch = protectedProcedure.query(async ({ ctx }) => {
  const user = ctx.session.user as User;
  const now = new Date();
  const classes = await prisma.userOnBookingTimeSlots.findMany({
    where: {
      userId: user.id,
      bookingTimeSlots: {
        date: {
          gte: now,
        },
      },
    },
  });
  const lessons = await prisma.lessons.findMany({
    where: {
      userId: user.id,
      expiryDate: {
        gte: now,
      },
      lesson: {
        gt: 0,
      },
    },
  });

  return { lessons, classes };
});
