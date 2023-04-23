import * as OneSignal from "@onesignal/node-onesignal";
import { LanguageEnum } from "@prisma/client";

export const appId = process.env["NEXT_PUBLIC_ONESIGNAL_APP_ID"]!;

const userAuthKey = process.env["NEXT_PUBLIC_ONESIGNAL_API_AUTH_KEY"]!;
const configuration = OneSignal.createConfiguration({
  appKey: appId,
  userKey: userAuthKey,
});
export const client = new OneSignal.DefaultApi(configuration);

export const sendNotification = async ({
  externalId,
  message,
  lang,
}: {
  externalId: string;
  lang: LanguageEnum;
  message: string;
}) => {
  const locale = lang === "EN" ? "en" : "zh_hant";
  await client.createNotification({
    app_id: appId,
    contents: {
      [locale]: message,
    },
    //@todo: get the user to the class
    // url: `${process.env.BACKEND_URL_DEVELOPMENT}/${externalId}`,
    included_segments: ["Subscribed Users"],
    external_id: externalId,
  });
};
