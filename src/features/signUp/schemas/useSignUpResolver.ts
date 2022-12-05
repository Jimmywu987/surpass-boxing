import { yupResolver } from "@hookform/resolvers/yup";
import useTranslation from "next-translate/useTranslation";
import { z } from "zod";

export const useSignUpResolver = () => {
  const { t } = useTranslation("auth");

  return yupResolver(
    z
      .object({
        username: z
          .string({ required_error: "Username is required" })
          .max(20, "username input exceed 20 letters"),
        email: z
          .string({ required_error: "Email Address is required" })
          .email("invalid email address"),
        password: z
          .string({ required_error: "Password is required" })
          .min(8, "At least 8-digit password is required"),
        confirmPassword: z
          .string({ required_error: "Confirm Password is required" })
          .min(8, "At least 8-digit password is required"),
        profileImg: z.any(),
      })
      .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
          ctx.addIssue({
            code: "custom",
            message: "The passwords did not match",
          });
        }
      })
  );
};
