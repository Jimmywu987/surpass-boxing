import { Card } from "@/features/common/components/Card";
import { SignUpForm } from "@/features/signUp/components/SignUpForm";
import useTranslation from "next-translate/useTranslation";
const SignUpPage = () => {
  const { t } = useTranslation("auth");

  return (
    <div className="flex justify-center items-center">
      <Card>
        <h1 className="text-2xl text-theme-color text-center">
          {t("sign_up.sign_up")}
        </h1>
        <SignUpForm />
      </Card>
    </div>
  );
};
export default SignUpPage;
