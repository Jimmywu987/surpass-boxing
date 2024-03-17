import { getReadyServiceWorker } from "@/services/notification/serviceWorker";

export const getCurrentPushSubscription =
  async (): Promise<PushSubscription | null> => {
    const sw = await getReadyServiceWorker();
    return sw.pushManager.getSubscription();
  };

export const registerPushSubscription = async () => {
  if (!("PushManager" in window)) {
    throw Error("Push Notification are not supported by this browser.");
  }
  const existingSubscription = await getCurrentPushSubscription();
  if (existingSubscription) {
    throw Error("Existing push subscription found.");
  }
  const sw = await getReadyServiceWorker();
  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY!,
  });

  return subscription;
};

export const unregisterPushSubscription = async () => {
  const existingSubscription = await getCurrentPushSubscription();
  if (!existingSubscription) {
    throw Error("No existing push subscription found.");
  }

  await existingSubscription.unsubscribe();
  return existingSubscription;
};
