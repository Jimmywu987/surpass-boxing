import { getZonedStartOfDay } from "@/helpers/getTimeZone";
import { addOffDaySchema } from "@/schemas/offDay/add";
import { protectedProcedure, router } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const offDayRouter = router({
  fetch: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = ctx.session.user as User;
    if (!user.admin) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return prisma.offDay.findMany({
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
      await prisma.offDay.delete({
        where: {
          id,
        },
      });
    }),
  removeAllPast: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = ctx.session.user as User;
    if (!user.admin) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    await prisma.offDay.deleteMany({
      where: {
        date: {
          lt: getZonedStartOfDay(new Date()),
        },
      },
    });
  }),
  add: protectedProcedure
    .input(addOffDaySchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = ctx.session.user as User;
      if (!user.admin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await prisma.offDay.create({
        data: {
          ...input,
          date: getZonedStartOfDay(new Date(input.date)),
        },
      });
    }),
});
