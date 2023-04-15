import { z } from "zod";

export const requestedClassCreateSchema = () =>
  z.object({
    id: z.string().optional(),
    date: z.string(),
    startTime: z.number(),
    endTime: z.number(),
    className: z.string(),
    setLimit: z.boolean().optional(),
    people: z.number().optional(),
    coachName: z.string().optional(),
  });
