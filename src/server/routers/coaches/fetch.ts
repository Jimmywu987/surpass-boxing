import { publicProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { z } from "zod";

export const fetch = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { userId } = input;
    return prisma.coachInfos.findMany({
      where: {
        coachId: userId,
      },
    });
  });
