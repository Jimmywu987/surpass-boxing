import { appId } from "@/services/onesignal";
import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";

export const useOneSignal = () => {
  const onesignalInitializingRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!onesignalInitializingRef.current) {
          onesignalInitializingRef.current = true;
          await OneSignal.init({
            appId,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true,
            },
          });

          OneSignal.addListenerForNotificationOpened((notification) =>
            console.info("Notification Opened", { notification })
          );

          OneSignal.on("notificationDisplay", (event) =>
            console.info("Notification Display", { event })
          );
        }
      } catch (e) {
        console.error("OneSignal init error", e);
      } finally {
        onesignalInitializingRef.current = false;
      }
    };

    init();
    return () => {};
  }, []);

  const storeUserExternalId = async (userId: string) => {
    await OneSignal.setExternalUserId(userId);
  };
  return {
    storeUserExternalId,
  };
};
