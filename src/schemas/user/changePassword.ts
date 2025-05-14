import { z } from "zod";

export const changePasswordSchema = z
  .object({
    id: z.string(),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "At least 8-digit password is required"),
    confirmPassword: z
      .string({ required_error: "Password is required" })
      .min(8, "At least 8-digit password is required"),
    oldPassword: z
      .string({ required_error: "Password is required" })
      .min(8, "At least 8-digit password is required"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
      });
    }
  });
