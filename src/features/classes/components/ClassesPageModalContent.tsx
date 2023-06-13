import { CreateRequestedClassForm } from "@/features/common/components/form/CreateRequestedClassForm";
import { OpenModelType } from "@/features/common/enums/OpenModelType";
import { LoginForm } from "@/features/login/components/LoginForm";
import { SignUpForm } from "@/features/signUp/components/SignUpForm";
import { UseDisclosureReturn } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";
import { Dispatch, SetStateAction } from "react";

export const ClassesPageModalContent = ({
  modelType,
  setModelType,
  modalDisclosure,
  date,
}: {
  modelType: OpenModelType;
  setModelType: Dispatch<SetStateAction<OpenModelType>>;
  modalDisclosure: UseDisclosureReturn;
  date: Date;
}) => {
  const { t } = useTranslation("classes");

  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  if (isAuthenticated) {
    if (modelType === OpenModelType.REQUEST_LESSON_MESSAGE) {
      return (
        <div>
          <p className="text-center">
            {t("request_class_message")}
            <span className="font-medium hover:font-semibold cursor-pointer">
              {t("contact_coach")}
            </span>
          </p>
        </div>
      );
    }
    return (
      <CreateRequestedClassForm modalDisclosure={modalDisclosure} date={date} />
    );
  }
  if (modelType === OpenModelType.SIGN_UP) {
    return (
      <SignUpForm
        LoginButton={
          <button
            className="text-blue-700 underline hover:text-blue-800"
            onClick={() => {
              setModelType(OpenModelType.LOGIN);
            }}
          >
            {t("auth:login.login")}
          </button>
        }
        action={{
          redirect: false,
        }}
      />
    );
  }
  return (
    <LoginForm
      SignUpButton={
        <button
          className="text-blue-700 underline hover:text-blue-800"
          onClick={() => {
            setModelType(OpenModelType.SIGN_UP);
          }}
        >
          {t("auth:sign_up.sign_up")}
        </button>
      }
      action={{
        redirect: false,
      }}
    />
  );
};
