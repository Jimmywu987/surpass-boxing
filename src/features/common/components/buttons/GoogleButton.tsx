import { signIn } from "next-auth/react";

import { GoogleSvgIcon } from "@/features/common/components/buttons/svg/GoogleSvgIcon";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { isEmbedded } from "react-device-detect";
import { cn } from "@/utils/cn";

export const GoogleButton = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation("auth");
  const router = useRouter();

  return (
    <button
      className={cn(
        " py-2 rounded shadow flex items-center w-full justify-center space-x-2 hover:bg-gray-50",
        !isEmbedded ? "cursor-pointer" : " opacity-70"
      )}
      onClick={() => {
        signIn(
          "google",
          router.route === "/classes"
            ? { redirect: false }
            : { callbackUrl: "/" }
        );
      }}
      disabled={loading || isEmbedded}
    >
      <GoogleSvgIcon className="w-5 h-5" />
      {!isEmbedded ? (
        <span className="text-gray-600">{t("sign_up_with_google")}</span>
      ) : (
        <span className="text-gray-600">{t("please_use_browser")}</span>
      )}
    </button>
  );
};
