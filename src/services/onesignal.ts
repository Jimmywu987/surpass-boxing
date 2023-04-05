import * as OneSignal from "@onesignal/node-onesignal";

export const appId = process.env["NEXT_PUBLIC_ONESIGNAL_APP_ID"]!;

const userAuthKey = process.env["NEXT_PUBLIC_ONESIGNAL_API_AUTH_KEY"]!;
const configuration = OneSignal.createConfiguration({
  appKey: appId,
  userKey: userAuthKey,
});
export const client = new OneSignal.DefaultApi(configuration);
