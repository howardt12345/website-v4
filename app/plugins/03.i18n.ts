import i18next from 'i18next';
import I18NextVue from 'i18next-vue';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import en from '../../public/locales/en/translation.json';

export const SUPPORTED_LANGUAGES: Record<string, { nativeName: string }> = {
  en: {
    nativeName: 'English',
  },
  zh: {
    nativeName: '國語 (臺灣）',
  },
};

// Bundle `en` so init is synchronous (no server HTTP fetch → prerender works,
// no first-paint await). Detector/backend are browser-only; the server renders `en`.
if (import.meta.client) {
  i18next.use(LanguageDetector).use(Backend);
}

export const i18nextPromise = i18next.init({
  fallbackLng: 'en',
  lng: import.meta.client ? undefined : 'en',
  resources: { en: { translation: en } },
  partialBundledLanguages: true,
  interpolation: {
    escapeValue: false,
  },
  load: 'languageOnly',
  returnEmptyString: false,
  saveMissing: import.meta.dev,
  saveMissingTo: 'current',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
});

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(I18NextVue, { i18next });
});
