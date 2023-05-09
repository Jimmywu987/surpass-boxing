import { router } from "@/server/trpc";
import { protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { User } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/services/prisma";

export const levelRecordRouter = router({
  fetch: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = ctx.session.user as User;
    if (!user.admin) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return await prisma.classLevelDifferentRecord.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = ctx.session.user as User;
      if (!user.admin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const { id } = input;
      await prisma.classLevelDifferentRecord.delete({
        where: {
          id,
        },
      });
    }),
});
