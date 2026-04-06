// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  build: { transpile: ['vuetify'] },
  devtools: { enabled: true },
  css: [
    '~/assets/scss/global.scss',
    '@fortawesome/fontawesome-svg-core/styles.css',
  ],
  vite: {
    // cookie v1.x is CJS-only; wrap it as ESM so browsers can do named imports.
    plugins: [{
      name: 'cookie-cjs-esm-compat',
      transform(code: string, id: string) {
        if (!id.includes('/node_modules/cookie/dist/index.js')) return;
        return [
          'const module = { exports: {} }; const exports = module.exports;',
          code,
          'const _c = module.exports;',
          // Function declarations are hoisted — re-export them directly to avoid redeclaration.
          // parse/serialize are aliases (not function names), so export via _c.
          'export { parseCookie, stringifyCookie, stringifySetCookie, parseSetCookie };',
          'export const parse = _c.parse;',
          'export const serialize = _c.serialize;',
          'export default _c;',
        ].join('\n');
      },
    } as any],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "~/assets/scss/_vars.scss" as *; @use "~/assets/scss/_functions.scss" as *;',
        },
      },
    },
    optimizeDeps: {
      include: ['cookie', '@supabase/ssr', '@supabase/ssr > cookie']
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
