import { z } from "zod";

export const addNewsSchema = z.object({
  title: z.string(),
  article: z.string(),
  img: z.string(),
  url: z.string().optional(),
});
