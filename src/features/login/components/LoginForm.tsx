import { useForm, FormProvider } from "react-hook-form";
import { LoginInputTypes } from "@/features/login/types/loginInputTypes";
import { useLoginResolver } from "@/features/login/schemas/useLoginResolver";
import { FormTextInput } from "@/features/common/components/input/FormTextInput";
import { useState } from "react";
import { ShowPassword } from "@/features/common/components/ShowPassword";
import { signIn } from "next-auth/react";
import { GoogleButton } from "@/features/common/components/buttons/GoogleButton";
import { useDispatch, useSelector } from "react-redux";
import { loadingSelector, isLoading } from "@/redux/loading";
import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

export const LoginForm = ({
  SignUpButton,
}: {
  SignUpButton: React.ReactNode;
}) => {
  const { t } = useTranslation("auth");

  const dispatch = useDispatch();
  const router = useRouter();
  const isLoginPage = router.pathname === "/login";

  const { loading } = useSelector(loadingSelector);
  const [showPassword, setShowPassword] = useState(false);

  const loginFormMethods = useForm<LoginInputTypes>({
    resolver: useLoginResolver(),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = loginFormMethods.handleSubmit(async (data) => {
    dispatch(isLoading({ isLoading: true }));
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    if (res && res.ok) {
      router.push("/");
    } else {
      // toast.error("Incorrect email or password, please try again.");
    }
    dispatch(isLoading({ isLoading: false }));
  });

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
        <SubmitButton type="submit" disabled={loading}>
          {t("login.login")}
        </SubmitButton>
      </form>
      <hr />
      <GoogleButton loading={loading} />
      <div className="border-b border-b-gray-200 my-2" />
      <div className="flex justify-center">
        <span>{t("join_already")}</span>
        {SignUpButton}
      </div>
    </FormProvider>
  );
};
