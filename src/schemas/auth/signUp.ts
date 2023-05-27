import { LanguageEnum } from "@prisma/client";
import { z } from "zod";

export const signUpSchema = z
  .object({
    username: z
      .string({ required_error: "Username is required" })
      .max(20, "username input exceed 20 letters"),
    email: z
      .string({ required_error: "Email Address is required" })
      .email("invalid email address"),
    lang: z.enum([LanguageEnum.EN, LanguageEnum.ZH]),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "At least 8-digit password is required"),
    confirmPassword: z
      .string({ required_error: "Confirm Password is required" })
      .min(8, "At least 8-digit password is required"),
    token: z.string(),
    profileImg: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
      });
    }
  });
