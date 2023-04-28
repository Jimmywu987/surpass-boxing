import { I18n } from "i18n";

export const i18n = new I18n({
  locales: ["en", "zh-HK"],
  defaultLocale: "zh-HK",
  staticCatalog: {
    en: require("@/../locales/en/notification.json"),
    "zh-HK": require("@/../locales/zh-HK/notification.json"),
  },
  objectNotation: true,
});
