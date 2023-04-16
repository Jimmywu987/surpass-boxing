import { z } from "zod";

export const addLessonSchema = () =>
  z.object({
    lesson: z.number().positive(),
    durationUnit: z.string(),
    duration: z.number().positive(),
    userId: z.string(),
  });
