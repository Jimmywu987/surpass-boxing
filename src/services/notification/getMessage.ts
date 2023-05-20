import { NotificationEnums } from "@/features/common/enums/NotificationEnums";

import { ClassLevelEnum, LanguageEnum } from "@prisma/client";
import { Replacements } from "i18n";
import { i18n } from "@/services/notification/i18n/i18n.config";

export type NotificationDataType = {
  [NotificationEnums.JOIN_CLASS]: {
    username: string;
    dateTime: string;
    time: string;
    className: string;
  };
  [NotificationEnums.JOIN_DIFFERENT_CLASS]: {
    username: string;
    dateTime: string;
    time: string;
    className: string;
    levelFrom: ClassLevelEnum;
    levelTo: ClassLevelEnum;
  };
  [NotificationEnums.CLASS_CONFIRMED]: {
    dateTime: string;
    time: string;
    className: string;
  };
  [NotificationEnums.CLASS_CANCELLED]: {
    dateTime: string;
    time: string;
    className: string;
  };
  [NotificationEnums.CLASS_CREATED]: {
    username: string;
    dateTime: string;
    time: string;
    className: string;
  };
  [NotificationEnums.CLASS_UPDATED]: {
    dateTime: string;
    time: string;
    className: string;
    updatedTime: string;
  };
  [NotificationEnums.LEAVE_CLASS]: {
    username: string;
    dateTime: string;
    time: string;
    className: string;
  };
};

export const getMessage = <TMessageKey extends keyof NotificationDataType>({
  lang,
  messageKey,
  data,
}: {
  lang: LanguageEnum;
  messageKey: TMessageKey;
  data: NotificationDataType[TMessageKey];
}) => {
  return i18n.__(
    {
      phrase: messageKey.toLowerCase(),
      locale: lang === LanguageEnum.EN ? "en" : "zh-HK",
    },
    data as unknown as Replacements
  );
};
