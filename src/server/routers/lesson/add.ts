import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { add } from "date-fns";

import { protectedProcedure } from "@/server/trpc";
import { addLessonSchema } from "@/schemas/lesson/add";

export const addLesson = protectedProcedure
  .input(addLessonSchema)
  .mutation(async ({ ctx, input }) => {
    const data = input;
    const user = ctx.session?.user as User;

    if (!user.admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    const { lesson, durationUnit, duration, userId, level } = data;
    return prisma.lessons.create({
      data: {
        lesson,
        expiryDate: add(new Date(), {
          [durationUnit]: duration,
        }),
        userId,
        level,
      },
    });
  });
