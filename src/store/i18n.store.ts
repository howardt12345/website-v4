
import i18next from 'i18next';

export const usei18n = defineStore('i18n', () => {
  const i18n = i18next;
  const languages = computed(() => i18n.languages);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return {
    changeLanguage,
    languages
  };
});