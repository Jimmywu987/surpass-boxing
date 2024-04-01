import { protectedProcedure, router } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const notificationRouter = router({
  fetch: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = ctx.session.user as User;
    if (!user.admin) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return prisma.notification.findMany({
      where: {
        OR: [{ adminId: user.id }, { adminId: null }],
      },
      orderBy: {
        createdAt: "desc",
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
      await prisma.notification.delete({
        where: {
          id,
        },
      });
    }),
  removeAll: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = ctx.session.user as User;
    if (!user.admin) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    await prisma.notification.deleteMany();
  }),
});
