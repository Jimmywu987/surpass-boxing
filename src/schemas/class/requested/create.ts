import { ClassLevelEnum } from "@prisma/client";
import { z } from "zod";

export const requestedClassCreateSchema = () =>
  z.object({
    id: z.string().optional(),
    date: z.string(),
    startTime: z.number(),
    endTime: z.number(),
    className: z.string().min(1),
    level: z.enum([
      ClassLevelEnum.BEGINNER,
      ClassLevelEnum.INTERMEDIATE,
      ClassLevelEnum.ADVANCED,
    ]),
    setLimit: z.boolean().optional(),
    people: z.number().optional(),
    coachId: z.string().optional(),
  });
