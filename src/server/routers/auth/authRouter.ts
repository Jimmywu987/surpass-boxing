import { router, publicProcedure } from "@/server/trpc";
import {
  UserAuthOptionsEnum,
  UserStatusEnum,
  LanguageEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { prisma } from "@/services/prisma";
import { validateSignUpInput } from "@/helpers/validateSignUpInput";
import { hashPassword } from "@/utils/hash";
import { signUpSchema } from "@/schemas/auth/signUp";
import { forgotPasswordSchema } from "@/schemas/auth/forgotPassword";
import { generateTemporaryPassword } from "@/helpers/generateTemporaryPassword";
import { sendEmail } from "@/services/nodemailer";

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
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      const { email } = input;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          authOption: true,
          lang: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if Google account
      if (user.authOption === UserAuthOptionsEnum.GOOGLE) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Google account cannot reset password",
        });
      }

      // Generate and hash temporary password
      const temporaryPassword = generateTemporaryPassword();
      const hashedPassword = await hashPassword(temporaryPassword);

      // Update database
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Send email
      const subject =
        user.lang === LanguageEnum.EN
          ? "Password Reset - Surpass Boxing"
          : "密碼重設 - Surpass Boxing";

      const message =
        user.lang === LanguageEnum.EN
          ? `Hello ${user.username},\n\nYour password has been reset.\n\nYour new temporary password is: ${temporaryPassword}\n\nPlease login and change your password from your profile page.\n\nLogin: https://surpass-boxing.vercel.app/login\n\nIf you didn't request this, please contact us immediately.`
          : `你好 ${user.username}，\n\n你的密碼已重設。\n\n你的新臨時密碼是：${temporaryPassword}\n\n請登入並在個人資料頁面更改密碼。\n\n登入：https://surpass-boxing.vercel.app/login\n\n如果你沒有要求重設密碼，請立即聯絡我們。`;

      await sendEmail(user.email, message, undefined, subject);

      return { success: true };
    }),
});
