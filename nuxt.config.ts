import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  build: { transpile: ['vuetify'] },
  devtools: { enabled: true },
  rootDir: 'src/',
  css: ['@/assets/scss/global.scss', 'vuetify/lib/styles/main.sass'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/_vars.scss" as *;',
        },
      },
    },
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  modules: [
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', 'storeToRefs'],
      },
    ],
    ['@nuxt/content', {}],
  ],
});
