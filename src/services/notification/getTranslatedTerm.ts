import { i18n } from "@/services/notification/i18n/i18n.config";

export const getTranslatedTerm = (term: string, locale: string) => {
  return i18n.__({
    phrase: `terms.${term.toLowerCase()}`,
    locale,
  });
};
