import { prisma } from "@/services/prisma";

import { protectedProcedure } from "@/server/trpc";
import { regularClassCreateSchema } from "@/schemas/class/regular/create";

export const create = protectedProcedure
  .input(regularClassCreateSchema)
  .mutation(async ({ input }) => {
    const { setLimit, people, ...data } = input;

    return prisma.regularBookingTimeSlots.create({
      data: {
        ...data,
        numberOfParticipants: setLimit ? people : null,
      },
    });
  });
