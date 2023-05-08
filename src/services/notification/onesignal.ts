import { NotificationEnums } from "@/features/common/enums/NotificationEnums";
import * as OneSignal from "@onesignal/node-onesignal";
import { LanguageEnum, User } from "@prisma/client";
import { Replacements } from "i18n";
import { i18n } from "@/services/notification/i18n/i18n.config";
import { prisma } from "@/services/prisma";
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

type NotificationDataType = {
  [NotificationEnums.JOIN_CLASS]: {
    username: string;
    dateTime: string;
    time: string;
    className: string;
  };
};

export const sendSingleNotification = async ({
  receiver,
  messageKey,
  data,
  url,
}: {
  receiver: User;
  messageKey: NotificationEnums;
  data: NotificationDataType[typeof messageKey];
  url: string;
}) => {
  const { lang, id } = receiver;

  const message = i18n.__(
    {
      phrase: messageKey.toLowerCase(),
      locale: lang === LanguageEnum.EN ? "en" : "zh-HK",
    },
    data as unknown as Replacements
  );

  await client.createNotification({
    app_id: appId,
    contents: {
      en: message,
    },
    //@todo: get the user to the class
    url: `${process.env.VERCEL_URL}/${url}`,
    included_segments: ["Subscribed Users"],
    include_external_user_ids: [id],
  });
  return message;
};
