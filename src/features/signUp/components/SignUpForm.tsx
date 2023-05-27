import { FormTextInput } from "@/features/common/components/input/FormTextInput";
import { ShowPassword } from "@/features/common/components/ShowPassword";
import { useS3Upload } from "next-s3-upload";
import { ChangeEvent, useState } from "react";
import { GoogleButton } from "@/features/common/components/buttons/GoogleButton";
import { CameraSvgIcon } from "@/features/signUp/components/svg/CameraSvgIcon";
import { FormProvider, useForm } from "react-hook-form";
import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { createStandaloneToast } from "@chakra-ui/toast";
import useTranslation from "next-translate/useTranslation";
import { signUpSchema } from "@/schemas/auth/signUp";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { LanguageEnum } from "@prisma/client";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export const SignUpForm = ({
  LoginButton,
  action,
}: {
  LoginButton: React.ReactNode;
  action: {
    redirect?: boolean;
    callbackUrl?: string;
  };
}) => {
  const { t, lang } = useTranslation("auth");
  const { mutateAsync, isLoading } = trpc.authRouter.signUp.useMutation();

  const { toast } = createStandaloneToast();

  const [showPassword, setShowPassword] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { uploadToS3 } = useS3Upload();

  const { executeRecaptcha } = useGoogleReCaptcha();
  const signUpFormMethods = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      lang: LanguageEnum.ZH,
      token: "",
      profileImg: "/default-profile-img.png",
    },
  });

  const handleFile = async (file: File) => {
    const { url } = await uploadToS3(file);
    return url;
  };
  const onClickUploadImageHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const imageFile = event.target.files[0];
      setUploadFile(imageFile);
    }
  };
  const onSubmit = signUpFormMethods.handleSubmit(async (data) => {
    if (!executeRecaptcha) {
      return;
    }
    try {
      const token = await executeRecaptcha("yourAction");

      await mutateAsync({
        ...data,
        token,
        lang: lang === "en" ? LanguageEnum.EN : LanguageEnum.ZH,
        profileImg: uploadFile
          ? await handleFile(uploadFile as File)
          : data.profileImg,
      });

      await signIn("credentials", {
        ...data,
        ...action,
      });
      toast({
        title: t("sign_up.account_created"),
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t("sign_up.create_account_fail"),
        description: t("sign_up.create_account_fail_description"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  });

  return (
    <FormProvider {...signUpFormMethods}>
      <h1 className="text-2xl text-theme-color text-center">
        {t("sign_up.sign_up")}
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col space-y-3 w-full">
        <FormTextInput
          type="text"
          name="username"
          label={t("common:account.username")}
        />
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
        <FormTextInput
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          label={t("sign_up.confirm_password")}
        />
        <ShowPassword
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
        <div>
          <label
            htmlFor="file-upload"
            className="flex items-center text-theme-color1 cursor-pointer space-x-1"
          >
            <CameraSvgIcon className="text-theme-color1 w-5 h-5" />
            <div>
              {uploadFile
                ? t("sign_up.uploaded")
                : t("sign_up.upload_profile_img")}
            </div>
          </label>
          <input
            className="hidden"
            id="file-upload"
            type="file"
            onChange={onClickUploadImageHandler}
          />
        </div>
        <SubmitButton type="submit" disabled={isLoading}>
          {t("sign_up.sign_up")}
        </SubmitButton>
      </form>
      <hr />
      <GoogleButton loading={signUpFormMethods.formState.isSubmitting} />
      <div className="border-b border-b-gray-200 my-2" />
      <div className="flex justify-center">
        <span>{t("join_already")}</span>
        {LoginButton}
      </div>
    </FormProvider>
  );
};
