import { defineNuxtPlugin } from 'nuxt/app';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, fa } from 'vuetify/iconsets/fa-svg';

import { theme_dark, theme_light } from '@/assets/theme/theme';

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    icons: {
      defaultSet: 'fa',
      aliases,
      sets: {
        fa,
      },
    },
    theme: {
      defaultTheme: 'dark',
      themes: {
        light: theme_light,
        dark: theme_dark,
      },
    },
  });
  nuxtApp.vueApp.use(vuetify);
});
