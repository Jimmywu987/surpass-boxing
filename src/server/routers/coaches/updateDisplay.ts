import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "@/server/trpc";

export const updateDisplay = protectedProcedure
  .input(
    z.object({
      shouldShow: z.boolean(),
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
    const { shouldShow, userId } = data;
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        shouldShow,
      },
    });
  });
