import { publicProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { z } from "zod";

export const fetch = publicProcedure.query(async () => {
  return prisma.regularBookingTimeSlots.findMany({
    include: {
      coach: {
        select: {
          username: true,
        },
      },
      cancelRegularBookingTimeSlot: true,
    },
  });
});
