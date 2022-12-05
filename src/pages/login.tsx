import { Card } from "@/features/common/components/Card";
import { LoginForm } from "@/features/login/components/LoginForm";
import useTranslation from "next-translate/useTranslation";
const LoginPage = () => {
  const { t } = useTranslation("auth");

  return (
    <div className="flex justify-center items-center">
      <Card>
        <h1 className="text-2xl text-theme-color text-center">
          {t("login.login")}
        </h1>
        <LoginForm />
      </Card>
    </div>
  );
};
export default LoginPage;
