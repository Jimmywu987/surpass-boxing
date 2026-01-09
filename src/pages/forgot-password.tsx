import { ForgotPasswordForm } from "@/features/login/components/ForgotPasswordForm";
import { useRouter } from "next/router";

const ForgotPasswordPage = () => {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full md:w-[420px] bg-white px-6 py-6 rounded shadow-md">
        <ForgotPasswordForm onBackToLogin={() => router.push("/login")} />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
