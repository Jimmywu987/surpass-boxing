import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { startOfDay, subDays } from "date-fns";
import { z } from "zod";

export const fetch = protectedProcedure
  .input(
    z.object({
      selectedDate: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const user = ctx.session.user as User;
    const { selectedDate } = input;

    const endOfSelectedDate = subDays(startOfDay(new Date(selectedDate)), 1);

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
