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

    await OneSignal.init({
      appId,
      notifyButton: {
        enable: true,
      },
      allowLocalhostAsSecureOrigin: true,
    });
    const externalId = await OneSignal.getExternalUserId();
    if (externalId === uid) {
      return;
    }
    await OneSignal.setExternalUserId(uid);
  };
  useEffect(() => {
    if (user) {
      initializeOneSignal(user.id);
    }

    return () => {};
  }, [user]);
};
