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
    const { id } = input;
    await prisma.coachInfos.delete({
      where: { id },
    });
  });
