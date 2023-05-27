import { appId, safari_web_id } from "@/services/notification/onesignal";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";

export const useOneSignal = () => {
  const onesignalInitializingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        if (!onesignalInitializingRef.current) {
          onesignalInitializingRef.current = true;
          await OneSignal.init({
            appId,
            safari_web_id,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true,
            },
          });
        }
      } catch (e) {
        console.error("OneSignal init error", e);
      } finally {
        onesignalInitializingRef.current = false;
      }
      console.log("fysuegfuysgfyeugsfugsgfe", safari_web_id);
    };

    init();
    return () => {};
  }, []);

  const storeUserExternalId = async (userId: string) => {
    try {
      const id = await OneSignal.getExternalUserId();

      if (userId === id) return;
      await OneSignal.setExternalUserId(userId);
    } catch (err) {}
  };
  const removeUserExternalId = async () => {
    await OneSignal.removeExternalUserId();
  };
  return {
    storeUserExternalId,
    removeUserExternalId,
  };
};
