import { GoogleButton } from "@/features/common/components/buttons/GoogleButton";
import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { FormTextInput } from "@/features/common/components/input/FormTextInput";
import { ShowPassword } from "@/features/common/components/ShowPassword";
import { useLoginResolver } from "@/features/login/schemas/useLoginResolver";
import { LoginInputTypes } from "@/features/login/types/loginInputTypes";
import { signIn } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export const LoginForm = ({
  SignUpButton,
}: {
  SignUpButton: React.ReactNode;
}) => {
  const { t } = useTranslation("auth");

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const loginFormMethods = useForm<LoginInputTypes>({
    resolver: useLoginResolver(),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = loginFormMethods.handleSubmit(async (data) => {
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    if (res && res.ok) {
    } else {
      // toast.error("Incorrect email or password, please try again.");
    }
  });
  const { formState } = loginFormMethods;
  return (
    <FormProvider {...loginFormMethods}>
      <h1 className="text-2xl text-theme-color text-center">
        {t("login.login")}
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col space-y-3 w-full">
        <FormTextInput
          type="email"
          name="email"
          label={t("common:account.email_address")}
        />
        <FormTextInput
          type={showPassword ? "text" : "password"}
          name="password"
          label={t("password")}
        />
        <ShowPassword
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
        <SubmitButton type="submit" disabled={formState.isSubmitting}>
          {t("login.login")}
        </SubmitButton>
      </form>
      <hr />
      <GoogleButton loading={formState.isSubmitting} />
      <div className="border-b border-b-gray-200 my-2" />
      <div className="flex justify-center">
        <span>{t("join_already")}</span>
        {SignUpButton}
      </div>
    </FormProvider>
  );
};
