import { z } from "zod";

export const addNewsSchema = z.object({
  title: z.string(),
  img: z.string(),
  content: z.any(),
});
