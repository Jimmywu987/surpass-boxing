import { ClassLevelEnum } from "@prisma/client";
import { z } from "zod";

export const addLessonSchema = z.object({
  lesson: z.number().positive(),
  durationUnit: z.string(),
  duration: z.number().positive(),
  userId: z.string(),
  startDate: z.date(),
  level: z.enum([
    ClassLevelEnum.BEGINNER,
    ClassLevelEnum.INTERMEDIATE,
    ClassLevelEnum.ADVANCED,
  ]),
});
