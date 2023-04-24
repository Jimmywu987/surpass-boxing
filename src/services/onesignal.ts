import * as OneSignal from "@onesignal/node-onesignal";
import { LanguageEnum } from "@prisma/client";

export const appId = process.env["NEXT_PUBLIC_ONESIGNAL_APP_ID"]!;

const userAuthKey = process.env["NEXT_PUBLIC_ONESIGNAL_API_AUTH_KEY"]!;
const userApiKey = process.env["NEXT_PUBLIC_ONESIGNAL_API_KEY"]!;

const configuration = OneSignal.createConfiguration({
  authMethods: {
    default: {
      getName: () => {
        return "Surpass Boxing";
      },
      applySecurityAuthentication: (context) => {
        context.setHeaderParam("Authorization", `Basic ${userApiKey}`);
      },
    },
  },
  appKey: appId,
  userKey: userAuthKey,
});

export const client = new OneSignal.DefaultApi(configuration);

export const sendNotification = async ({
  externalId,
  message,
}: {
  externalId: string;
  message: string;
}) => {
  await client.createNotification({
    app_id: appId,
    contents: {
      en: message,
    },
    //@todo: get the user to the class
    // url: `${process.env.BACKEND_URL_DEVELOPMENT}/${externalId}`,
    included_segments: ["Subscribed Users"],
    include_external_user_ids: [externalId],
  });
};
