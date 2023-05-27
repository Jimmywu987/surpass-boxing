import * as OneSignal from "@onesignal/node-onesignal";

export const appId = process.env["NEXT_PUBLIC_ONESIGNAL_APP_ID"]!;

const userAuthKey = process.env["NEXT_PUBLIC_ONESIGNAL_API_AUTH_KEY"]!;
const userApiKey = process.env["NEXT_PUBLIC_ONESIGNAL_API_KEY"]!;
export const safariWebId =
  process.env["NEXT_PUBLIC_ONESIGNAL_API_SAFARI_WEB_ID"]!;
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

export const sendSingleNotification = async ({
  receiverIds,
  url,
  message,
}: {
  receiverIds: string[];
  url: string;
  message: string;
}) => {
  await client.createNotification({
    app_id: appId,
    contents: {
      en: message,
    },
    //@todo: get the user to the class
    url: `${
      process.env.NODE_ENV === "development"
        ? process.env.BACKEND_URL_DEVELOPMENT
        : process.env.BACKEND_URL_PRODUCTION
    }/${url}`,
    included_segments: ["Subscribed Users"],
    include_external_user_ids: receiverIds,
  });
};
