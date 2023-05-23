import { LoginForm } from "@/features/login/components/LoginForm";

import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";

const LoginPage = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-center items-center">
      <div className="w-full md:w-[420px] bg-white px-6 py-3 rounded">
        <LoginForm
          SignUpButton={
            <button
              className="text-blue-700 underline hover:text-blue-800"
              onClick={() => {
                router.push("/sign-up");
              }}
            >
              {t("auth:sign_up.sign_up")}
            </button>
          }
          action={{
            callbackUrl: "/",
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
