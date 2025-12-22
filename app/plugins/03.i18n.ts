import i18next from 'i18next';
import I18NextVue from 'i18next-vue';
import detector from 'i18next-browser-languagedetector';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export const SUPPORTED_LANGUAGES: Record<string, { nativeName: string }> = {
  en: {
    nativeName: 'English',
  },
  zh: {
    nativeName: '國語 (臺灣）',
  },
};

export const i18nextPromise = i18next
  .use(detector)
  .use(Backend)
  .use(LanguageDetector)
  .init({
    debug: true,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },
    load: 'languageOnly',
    returnEmptyString: false,
    saveMissing: true,
    saveMissingTo: 'current',
  });

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(I18NextVue, { i18next });
});
