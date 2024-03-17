import { getServerConfig } from "@/utils/getServerConfig";

import webPush, { PushSubscription } from "web-push";

const config = getServerConfig();

const {
  env: { WEB_PUSH_PRIVATE_KEY },
} = config;

export const sendWebPushSingleNotification = async ({
  subscription,
  data,
}: {
  subscription: PushSubscription;
  data: any;
}) => {
  await webPush.sendNotification(subscription, JSON.stringify(data), {
    vapidDetails: {
      subject: "jimmywu987@gmail.com",
      privateKey: WEB_PUSH_PRIVATE_KEY,
      publicKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY!,
    },
  });
};
