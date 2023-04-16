import { router, protectedProcedure, publicProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

import { prisma } from "@/services/prisma";
import { z } from "zod";
import { requestedClassRouter } from "@/server/routers/class/requested/requestedClassRouter";
import { regularClassRouter } from "@/server/routers/class/regular/regularClassRouter";

export const classRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { name } = input;
        return prisma.classesType.create({
          data: { name },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }
    }),
  fetch: publicProcedure.query(async () => {
    try {
      return prisma.classesType.findMany();
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Something went wrong",
      });
    }
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { id } = input;
        return prisma.classesType.delete({
          where: { id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }
    }),
  requestedClassRouter,
  regularClassRouter,
});
