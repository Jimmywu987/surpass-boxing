import { signIn } from "next-auth/react";

import { GoogleSvgIcon } from "@/features/common/components/buttons/svg/GoogleSvgIcon";
import useTranslation from "next-translate/useTranslation";
export const GoogleButton = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation("auth");

  return (
    <button
      className="cursor-pointer py-2 rounded shadow flex items-center w-full justify-center space-x-2 hover:bg-gray-50 "
      onClick={() => {
        signIn("google", { callbackUrl: "/" });
      }}
      disabled={loading}
    >
      <GoogleSvgIcon className="w-5 h-5" />
      <span className="text-gray-600">{t("sign_up_with_google")}</span>
    </button>
  );
};
