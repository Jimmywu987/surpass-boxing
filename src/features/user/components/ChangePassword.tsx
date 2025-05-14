import { useChangePasswordResolver } from "@/features/admin/schemas/useChangePasswordResolver";
import { ShowPassword } from "@/features/common/components/ShowPassword";
import { FormTextInput } from "@/features/common/components/input/FormTextInput";
import { changePasswordSchema } from "@/schemas/user/changePassword";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import useTranslation from "next-translate/useTranslation";
import { trpc } from "@/utils/trpc";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/utils/cn";
import { createStandaloneToast } from "@chakra-ui/react";

type Props = {
  onBack: () => void;
  id: string;
};
export const ChangePassword = ({ onBack, id }: Props) => {
  const { toast } = createStandaloneToast();

  const { t } = useTranslation("auth");

  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync, isLoading } =
    trpc.userRouter.changePassword.useMutation();

  const changePasswordFormMethods = useForm<
    z.infer<typeof changePasswordSchema>
  >({
    resolver: useChangePasswordResolver(),
    mode: "onChange",
    defaultValues: {
      id: id,
      password: "",
      confirmPassword: "",
      oldPassword: "",
    },
  });
  const { handleSubmit, formState, reset } = changePasswordFormMethods;

  const onHandleChangePassword = handleSubmit(async (data) => {
    try {
      await mutateAsync(data);
      toast({
        title: t("changed_successfully"),
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      reset();
      onBack();
    } catch (error) {
      toast({
        title: t("change_fail"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  });
  const canProceed = isLoading || !formState.isValid;
  return (
    <div className="space-y-2">
      <ChevronLeftIcon fontSize="3xl" cursor="pointer" onClick={onBack} />
      <FormProvider {...changePasswordFormMethods}>
        <FormTextInput
          type={showPassword ? "text" : "password"}
          name="oldPassword"
          shouldValidate
          label={t("old_password")}
        />
        <FormTextInput
          type={showPassword ? "text" : "password"}
          name="password"
          shouldValidate
          label={t("password")}
        />
        <FormTextInput
          type={showPassword ? "text" : "password"}
          shouldValidate
          name="confirmPassword"
          label={t("sign_up.confirm_password")}
        />
        <ShowPassword
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      </FormProvider>
      <div className="flex justify-end">
        <button
          onClick={onHandleChangePassword}
          disabled={canProceed}
          className={cn(
            "text-gray-600 shadow border-2 border-gray-200 px-3 py-1 hover:text-gray-800 font-semibold ",
            canProceed ? "opacity-30" : "cursor-pointer"
          )}
        >
          {t("admin:edit")}
        </button>
      </div>
    </div>
  );
};
