import { createUser } from "@/apis/api";
import { FormTextInput } from "@/features/common/components/input/FormTextInput";
import { ShowPassword } from "@/features/common/components/ShowPassword";
import { useSignUpResolver } from "@/features/signUp/schemas/useSignUpResolver";
import { SignUpInputTypes } from "@/features/signUp/types/signUpInputTypes";

import { useS3Upload } from "next-s3-upload";
import { useRouter } from "next/router";
import { useState } from "react";

import { FormProvider, useForm } from "react-hook-form";
import { CameraSvgIcon } from "@/features/signUp/components/svg/CameraSvgIcon";
import { GoogleButton } from "@/features/common/components/buttons/GoogleButton";
import { useDispatch, useSelector } from "react-redux";
import { isLoading, loadingSelector } from "@/redux/loading";

import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { createStandaloneToast } from "@chakra-ui/toast";
import useTranslation from "next-translate/useTranslation";

import { signIn } from "next-auth/react";

export const SignUpForm = ({
  LoginButton,
}: {
  LoginButton: React.ReactNode;
}) => {
  const { t } = useTranslation("auth");

  const { register, watch } = useForm();
  const { toast } = createStandaloneToast();

  const dispatch = useDispatch();
  const { loading } = useSelector(loadingSelector);

  const [showPassword, setShowPassword] = useState(false);
  const { uploadToS3 } = useS3Upload();

  const signUpFormMethods = useForm<SignUpInputTypes>({
    resolver: useSignUpResolver(),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const profileImg = watch("profileImg");
  const updatedProfileImg = profileImg && profileImg.length === 1;

  const onSubmit = signUpFormMethods.handleSubmit(async (data) => {
    dispatch(isLoading({ isLoading: true }));

    let imgUrl = "/default-profile-img.png";
    if (updatedProfileImg) {
      const { url } = await uploadToS3(profileImg[0]);
      imgUrl = url;
    }
    const res = await createUser({
      ...data,
      profileImg: imgUrl,
    });

    if (res && res.status === 201) {
      dispatch(isLoading({ isLoading: false }));
      toast({
        title: t("sign_up.account_created"),
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      await signIn("credentials", {
        ...data,
        redirect: false,
      });
      return;
    }
    toast({
      title: t("sign_up.create_account_fail"),
      description: t("sign_up.create_account_fail_description"),
      status: "error",
      duration: 4000,
      isClosable: true,
    });
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
          label={t("sign_up.username")}
        />
        <FormTextInput type="email" name="email" label={t("email_address")} />
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
            htmlFor="fileUpload"
            className="flex items-center text-theme-color1 cursor-pointer space-x-1"
          >
            <CameraSvgIcon className="text-theme-color1 w-5 h-5" />
            <div>
              {updatedProfileImg
                ? t("sign_up.uploaded")
                : t("sign_up.upload_profile_img")}
            </div>
          </label>
          <input
            className="hidden"
            id="fileUpload"
            type="file"
            {...register("profileImg")}
          />
        </div>
        <SubmitButton type="submit" disabled={loading}>
          {t("sign_up.sign_up")}
        </SubmitButton>
      </form>
      <hr />
      <GoogleButton loading={loading} />
      <div className="border-b border-b-gray-200 my-2" />
      <div className="flex justify-center">
        <span>{t("join_already")}</span>
        {LoginButton}
      </div>
    </FormProvider>
  );
};
