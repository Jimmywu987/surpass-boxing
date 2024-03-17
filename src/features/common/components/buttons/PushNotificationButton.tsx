import {
  getCurrentPushSubscription,
  registerPushSubscription,
  unregisterPushSubscription,
} from "@/services/notification/getCurrentPushSubscription";
import { useEffect, useState } from "react";
import { PushNotificationSvgIcon } from "./svg/PushSubscriptionIcon";
import { cn } from "@/utils/cn";

import { trpc } from "@/utils/trpc";

export const PushNotificationButton = () => {
  const utils = trpc.useContext();

  const add = trpc.userRouter.addPushNotification.useMutation({
    onSuccess: () => {
      utils.userRouter.fetch.invalidate();
    },
  });

  const remove = trpc.userRouter.removePushNotification.useMutation({
    onSuccess: () => {
      utils.userRouter.fetch.invalidate();
    },
  });

  const [hasActivePushSubscription, setHasActivePushSubscription] =
    useState<boolean>();
  useEffect(() => {
    (async () => {
      const subscription = await getCurrentPushSubscription();
      setHasActivePushSubscription(!!subscription);
    })();
  }, []);

  const setPushNotificationEnable = async () => {
    const isEnable = !hasActivePushSubscription === true;

    if (isEnable) {
      const subscription = await registerPushSubscription();
      add.mutateAsync({ pushSubscription: subscription });
    } else {
      const subscription = await unregisterPushSubscription();
      remove.mutateAsync({ pushSubscription: subscription });
    }
    setHasActivePushSubscription(!hasActivePushSubscription);
  };
  if (hasActivePushSubscription === undefined) return null;

  return (
    <button
      className="relative justify-center items-center"
      onClick={setPushNotificationEnable}
      disabled={add.isLoading || remove.isLoading}
    >
      <div
        className={cn(
          "w-6 mx-auto top-2/4 bottom-2/4 transform rotate-45 h-0.5 bg-slate-100 absolute",
          hasActivePushSubscription && "hidden"
        )}
      />

      <PushNotificationSvgIcon
        fill={add.isLoading || remove.isLoading ? "#ffffff5e" : "#fff"}
      />
    </button>
  );
};
