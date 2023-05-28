import { appId } from "@/services/notification/onesignal";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";

export const useOneSignal = () => {
  const [oneSignalInitialized, setOneSignalInitialized] = useState(false);
  const session = useSession();
  const user = session.data?.user as User;

  const initializeOneSignal = async (uid: string) => {
    if (oneSignalInitialized) {
      return;
    }
    setOneSignalInitialized(true);
    try {
      await OneSignal.init({
        appId,
        notifyButton: {
          enable: true,
        },
        allowLocalhostAsSecureOrigin: true,
      });
      const externalId = await OneSignal.getExternalUserId();
      await OneSignal.addListenerForNotificationOpened((callback) => {
        console.log("callbackfisebfisbfiuesbfiusbe", callback);
      });
      await OneSignal.showNativePrompt();
      if (externalId === uid) {
        return;
      }
      await OneSignal.setExternalUserId(uid);
    } catch (err) {
      console.log(
        "error initializing one signal onesignal is really on99999999",
        err
      );
    }
  };
  useEffect(() => {
    console.log("on999999999999????");
    if (user) {
      initializeOneSignal(user.id);
    }

    return () => {};
  }, [user]);
};
