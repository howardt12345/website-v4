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
    'nitro:build:public-assets': async (nitro) => {
      const { readdir, readFile, rm, access } = await import('node:fs/promises');
      const { join, resolve } = await import('node:path');
      const { parse: parseYaml } = await import('yaml');

      const contentPhotosDir = resolve(process.cwd(), 'content/photos');
      const outputPublicDir = nitro.options.output.publicDir;

      const allFiles = await readdir(contentPhotosDir, { recursive: true, encoding: 'utf8' });
      const yamlFiles = allFiles.filter(f => f.endsWith('.yaml') && !f.endsWith('index.yaml'));

      await Promise.all(yamlFiles.map(async (relPath) => {
        const raw = await readFile(join(contentPhotosDir, relPath), 'utf8');
        const parsed = parseYaml(raw) as Record<string, unknown>;
        if (!parsed?.hide) return;

        const stem = relPath.replace(/\.yaml$/, '');
        const ext = (parsed.ext as string | undefined) ?? 'jpg';
        const assetPath = join(outputPublicDir, 'photos', `${stem}.${ext}`);
        const existsInOutput = await access(assetPath).then(() => true, () => false);

        if (existsInOutput) {
          await rm(assetPath);
          console.log(`[photos] Removed hidden asset from output: photos/${stem}.${ext}`);
        }
      }));
    },
  },
  compatibilityDate: '2024-11-01',
});
