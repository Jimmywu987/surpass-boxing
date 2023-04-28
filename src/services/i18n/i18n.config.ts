import { I18n } from "i18n";
import path from "path";

export const i18n = new I18n({
  locales: ["en", "zh-HK"],
  defaultLocale: "zh-HK",
  directory: path.join(__dirname, "locales"),
  objectNotation: true,
});
