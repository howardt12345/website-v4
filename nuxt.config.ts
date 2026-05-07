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
    '@nuxt/eslint',
  ],
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
      const { parse: parseYaml } = await import('yaml');

      const contentPhotosDir = resolve(process.cwd(), 'content/photos');
      const outputPublicDir = nitro.options.output.publicDir;

      const yamlFiles = (readdirSync(contentPhotosDir, { recursive: true, encoding: 'utf8' }) as string[])
        .filter(f => f.endsWith('.yaml') && !f.endsWith('index.yaml'));

      for (const relPath of yamlFiles) {
        const raw = readFileSync(join(contentPhotosDir, relPath), 'utf8');
        const parsed = parseYaml(raw) as Record<string, unknown>;
        if (!parsed?.hide) continue;

        const stem = relPath.replace(/\.yaml$/, '');
        const ext = (parsed.ext as string | undefined) ?? 'jpg';
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
