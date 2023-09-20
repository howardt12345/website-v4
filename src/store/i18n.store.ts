import { useTranslation } from 'i18next-vue';

export const usei18n = defineStore('i18n', () => {
  const { i18next, t } = useTranslation();
  const languages = computed(() => i18next.languages);
  const currentLanguage = computed(() => i18next.resolvedLanguage ?? i18next.language);

  const changeLanguage = (language: string) => {
    i18next.changeLanguage(language);
  };

  return {
    changeLanguage,
    currentLanguage,
    languages,
    t
  };
});
