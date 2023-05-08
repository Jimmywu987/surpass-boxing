export const getTranslatedTerm = (term: string, locale: string) => {
  i18n.__({
    phrase: `terms.${term.toLowerCase()}`,
    locale,
  });
};
