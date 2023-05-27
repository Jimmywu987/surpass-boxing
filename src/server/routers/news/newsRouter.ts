import { addNewsSchema } from "@/schemas/news/add";
import { publicProcedure, router, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const newsRouter = router({
  fetch: publicProcedure.query(async () => {
    return prisma.news.findMany();
  }),
  add: protectedProcedure
    .input(addNewsSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = ctx.session.user as User;
      if (!user.admin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await prisma.news.create({
        data: input,
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
      await prisma.news.delete({
        where: {
          id,
        },
      });
    }),
});
