import { prisma } from "@/services/prisma";

import { protectedProcedure } from "@/server/trpc";
import { z } from "zod";

export const remove = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { setLimit, people, ...data } = input;
    return prisma.regularBookingTimeSlots.create({
      data: { ...data, numberOfParticipants: setLimit ? people : null },
    });
  });
