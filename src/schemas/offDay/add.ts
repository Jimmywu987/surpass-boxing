import { z } from "zod";

export const addOffDaySchema = z.object({
  date: z.string(),
  reason: z.string().optional(),
});
