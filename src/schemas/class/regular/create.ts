import { ClassLevelEnum } from "@prisma/client";
import { z } from "zod";

export const regularClassCreateSchema = z.object({
  monday: z.boolean(),
  tuesday: z.boolean(),
  wednesday: z.boolean(),
  thursday: z.boolean(),
  friday: z.boolean(),
  saturday: z.boolean(),
  sunday: z.boolean(),
  startTime: z.number(),
  endTime: z.number(),
  className: z.string().min(1),
  level: z.enum([
    ClassLevelEnum.BEGINNER,
    ClassLevelEnum.INTERMEDIATE,
    ClassLevelEnum.ADVANCED,
  ]),
  coachId: z.string().min(1),
  setLimit: z.boolean().optional(),
  people: z.number().optional(),
});
