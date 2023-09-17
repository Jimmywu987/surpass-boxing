import { router, protectedProcedure, publicProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

import { prisma } from "@/services/prisma";
import { z } from "zod";
import { requestedClassRouter } from "@/server/routers/class/requested/requestedClassRouter";
import { regularClassRouter } from "@/server/routers/class/regular/regularClassRouter";
import { levelRecordRouter } from "@/server/routers/class/levelRecord/levelRecordRouter";
import { ClassLevelEnum } from "@prisma/client";
import { fetchConfirmedClasses } from "@/server/routers/class/fetchConfirmedClass";

export const classRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        level: z.enum([
          ClassLevelEnum.ADVANCED,
          ClassLevelEnum.BEGINNER,
          ClassLevelEnum.INTERMEDIATE,
        ]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return prisma.classesType.create({
          data: input,
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
  fetchConfirmedClasses,
  requestedClassRouter,
  regularClassRouter,
  levelRecordRouter,
});
