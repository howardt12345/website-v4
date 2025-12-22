// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  build: { transpile: ['vuetify'] },
  devtools: { enabled: true },
  css: [
    'vuetify/lib/styles/main.sass',
    '~/assets/scss/global.scss',
    '@fortawesome/fontawesome-svg-core/styles.css',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "~/assets/scss/_vars.scss" as *; @use "~/assets/scss/_functions.scss" as *;',
        },
      },
    },
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  modules: [
    '@pinia/nuxt',
    '@nuxt/content',
    '@vueuse/motion/nuxt',
    '@nuxtjs/supabase',
    '@nuxt/eslint',
  ],
  supabase: {
    redirect: false,
  },
  routeRules: {
    '/about': { prerender: true },
    '/projects': { prerender: true },
  },
  content: {
    experimental: { sqliteConnector: 'native' }
  },
  compatibilityDate: '2024-11-01',
});
