import { z } from "zod";

export const editAccountSchema = () =>
  z.object({
    id: z.string(),
    profileImg: z.string(),
    username: z.string(),
    phoneNumber: z.string().optional(),
  });
