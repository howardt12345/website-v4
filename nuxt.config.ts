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
    '/about': { redirect: '/#about' },
    '/experience': { redirect: '/#experience' },
    '/projects': { redirect: '/#projects' },
    '/contact': { redirect: '/#contact' },
  },
  content: {
    experimental: { sqliteConnector: 'native' }
  },
  hooks: {
    // After Nitro copies public assets to the output directory, remove any photo
    // files whose YAML has `hide: true` so they are unreachable in production.
    'nitro:build:public-assets': async (nitro) => {
      const { existsSync, readdirSync, readFileSync, rmSync } = await import('node:fs');
      const { join, resolve } = await import('node:path');

      const contentPhotosDir = resolve(process.cwd(), 'content/photos');
      const outputPublicDir = nitro.options.output.publicDir;

      const yamlFiles = (readdirSync(contentPhotosDir, { recursive: true, encoding: 'utf8' }) as string[])
        .filter(f => f.endsWith('.yaml') && !f.endsWith('index.yaml'));

      for (const relPath of yamlFiles) {
        const yamlContent = readFileSync(join(contentPhotosDir, relPath), 'utf8');
        if (!/^hide:\s+true(?:\s*#.*)?$/m.test(yamlContent)) continue;

        const stem = relPath.replace(/\.yaml$/, '');
        const extMatch = yamlContent.match(/^ext:\s*["']?(\w+)["']?\s*$/m);
        const ext = extMatch?.[1] ?? 'jpg';
        const assetPath = join(outputPublicDir, 'photos', `${stem}.${ext}`);

        if (existsSync(assetPath)) {
          rmSync(assetPath);
          console.log(`[photos] Removed hidden asset from output: photos/${stem}.${ext}`);
        }
      }
    },
  },
  compatibilityDate: '2024-11-01',
});
