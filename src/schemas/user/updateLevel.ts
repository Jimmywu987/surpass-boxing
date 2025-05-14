import { z } from "zod";

export const updateLevelSchema = () =>
  z.object({
    id: z.string(),
    level: z.number(),
  });
