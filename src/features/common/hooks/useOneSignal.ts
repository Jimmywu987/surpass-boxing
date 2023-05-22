import { appId } from "@/services/notification/onesignal";
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
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true,
            },
          });

          OneSignal.addListenerForNotificationOpened((notification) => {
            router.push({
              pathname: "/admin",
              query: notification.data,
            });
            console.info("Notification Opened", { notification });
          });

          OneSignal.on("notificationDisplay", (event) => {
            console.info("Notification Display", { event });
          });
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
