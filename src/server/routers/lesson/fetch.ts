import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { startOfDay, subDays } from "date-fns";

export const fetch = protectedProcedure.query(async ({ ctx }) => {
  const user = ctx.session.user as User;
  const selectedDate = new Date();

  const endOfSelectedDate = subDays(startOfDay(selectedDate), 1);

  const lessons = await prisma.lessons.findMany({
    where: {
      userId: user.id,
      expiryDate: {
        gte: endOfSelectedDate,
      },
    },
  });

  return { lessons };
});
