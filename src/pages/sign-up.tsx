import { SignUpForm } from "@/features/signUp/components/SignUpForm";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";

const SignUpPage = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-center items-center">
      <div className="w-full md:w-[420px] bg-white px-6 py-3 rounded">
        <SignUpForm
          LoginButton={
            <button
              className="text-blue-700 underline hover:text-blue-800"
              onClick={() => {
                router.push("/login");
              }}
            >
              {t("auth:login.login")}
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

export default SignUpPage;
