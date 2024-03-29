import { router, publicProcedure } from "@/server/trpc";
import { UserAuthOptionsEnum, UserStatusEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { prisma } from "@/services/prisma";
import { validateSignUpInput } from "@/helpers/validateSignUpInput";
import { hashPassword } from "@/utils/hash";
import { signUpSchema } from "@/schemas/auth/signUp";

export const authRouter = router({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const {
      confirmPassword,
      password,
      profileImg,
      email,
      username,
      lang,
      token,
    } = input;
    const reCaptchaResultJSON = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET}&response=${token}`
    );
    const reCaptchaResult = await reCaptchaResultJSON.json();

    if (reCaptchaResult.success && reCaptchaResult.score >= 0.5) {
      if (confirmPassword !== password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "incorrect password",
        });
      }
      const hasUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (hasUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }
      const isValidInput = validateSignUpInput(email, password);
      if (!isValidInput) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid input",
        });
      }
      const hashedPassword = await hashPassword(password);
      const createUserData = {
        username,
        email,
        profileImg,
        password: hashedPassword,
        authOption: UserAuthOptionsEnum.CREDENTIAL,
        phoneNumber: "",
        lang,
        status: UserStatusEnum.ACTIVE,
      };
      return await prisma.user.create({
        data: createUserData,
      });
    }
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }),
});
