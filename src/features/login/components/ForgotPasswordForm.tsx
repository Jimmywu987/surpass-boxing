import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { FormTextInput } from "@/features/common/components/input/FormTextInput";
import { useForgotPasswordResolver } from "@/features/login/schemas/useForgotPasswordResolver";
import { ForgotPasswordInputTypes } from "@/features/login/types/forgotPasswordInputTypes";
import { trpc } from "@/utils/trpc";
import { createStandaloneToast } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { FormProvider, useForm } from "react-hook-form";

export const ForgotPasswordForm = ({
  onBackToLogin,
}: {
  onBackToLogin: () => void;
}) => {
  const { t } = useTranslation("auth");
  const { toast } = createStandaloneToast();
  const { mutateAsync } = trpc.authRouter.forgotPassword.useMutation();

  const forgotPasswordFormMethods = useForm<ForgotPasswordInputTypes>({
    resolver: useForgotPasswordResolver(),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = forgotPasswordFormMethods.handleSubmit(async (data) => {
    try {
      await mutateAsync(data);
      toast({
        title: t("forgot_password.email_sent_successfully"),
        description: t("forgot_password.check_your_email"),
        status: "success",
        duration: 6000,
        isClosable: true,
      });
      // Optionally redirect back to login after a delay
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error?.message === "User not found"
          ? t("forgot_password.user_not_found")
          : error?.message === "Google account cannot reset password"
          ? t("forgot_password.google_account_error")
          : t("forgot_password.email_send_failed");

      toast({
        title: errorMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  });

  const { formState } = forgotPasswordFormMethods;

  return (
    <FormProvider {...forgotPasswordFormMethods}>
      <h1 className="text-2xl text-theme-color text-center">
        {t("forgot_password.reset_password")}
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col space-y-3 w-full">
        <FormTextInput
          type="email"
          name="email"
          label={t("forgot_password.enter_email")}
        />
        <SubmitButton type="submit" disabled={formState.isSubmitting}>
          {t("forgot_password.reset_password")}
        </SubmitButton>
      </form>
      <div className="flex justify-center mt-4">
        <button
          type="button"
          className="text-blue-700 underline hover:text-blue-800 text-sm"
          onClick={onBackToLogin}
        >
          {t("forgot_password.back_to_login")}
        </button>
      </div>
    </FormProvider>
  );
};
