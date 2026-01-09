import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email Address is required" })
    .email("Invalid email address"),
});
