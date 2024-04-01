import { z } from "zod";

export const hideRegularClassSchema = z.object({
  date: z.string(),
  timeSlotId: z.string(),
});
