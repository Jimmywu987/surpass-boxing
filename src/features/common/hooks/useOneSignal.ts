import { appId } from "@/services/notification/onesignal";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import OneSignal from "react-onesignal";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";

export const useOneSignal = () => {
  const [oneSignalInitialized, setOneSignalInitialized] =
    useState<boolean>(false);
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
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

    await OneSignal.setExternalUserId(uid);
  };
  useEffect(() => {
    if (user) {
      initializeOneSignal(user.id);
    }

    return () => {};
  }, [user]);
};
