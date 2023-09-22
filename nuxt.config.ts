import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  build: { transpile: ['vuetify'] },
  devtools: { enabled: true },
  rootDir: 'src/',
  css: [
    'vuetify/lib/styles/main.sass',
    '@/assets/scss/global.scss',
    '@fortawesome/fontawesome-svg-core/styles.css',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "@/assets/scss/_vars.scss" as *; @use "@/assets/scss/_functions.scss" as *;',
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
    '@vueuse/motion/nuxt',
    ['@nuxtjs/supabase', {
      redirect: false
    }],
  ],
  routeRules: {
    '/about': { prerender: true },
    '/projects': { prerender: true },
  },
});
