import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "@/server/trpc";

import { z } from "zod";

export const addTitle = protectedProcedure
  .input(
    z.object({
      zhTitle: z.string(),
      enTitle: z.string().nullable(),
      userId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const data = input;
    const user = ctx.session?.user as User;

    if (!user.admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    const { zhTitle, enTitle, userId } = data;
    return prisma.coachInfos.create({
      data: {
        enTitle,
        zhTitle,
        coachId: userId,
      },
    });
  });
