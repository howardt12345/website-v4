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
    '/**': { headers: { 'X-Robots-Tag': 'noai, noimageai' } },
  },
  content: {
    experimental: { sqliteConnector: 'native' }
  },
  hooks: {
    'nitro:build:public-assets': async (nitro) => {
      const { readdir, readFile, writeFile, rm, access } = await import('node:fs/promises');
      const { join, resolve } = await import('node:path');
      const { parse: parseYaml } = await import('yaml');
      const { default: sharp } = await import('sharp');

      const contentPhotosDir = resolve(process.cwd(), 'content/photos');
      const outputPublicDir = nitro.options.output.publicDir;

      // Public photos get downsized + watermarked so a scrape only nets a
      // web-res, marked copy — never the full-res original.
      const MAX_EDGE = 800;
      const watermarkSvg = (width: number, height: number) => {
        const fontSize = Math.max(14, Math.round(width * 0.028));
        const padding = Math.round(fontSize * 0.8);
        return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <text x="${width - padding}" y="${height - padding}" text-anchor="end"
            font-family="sans-serif" font-size="${fontSize}" font-weight="600"
            fill="rgba(255,255,255,0.75)" stroke="rgba(0,0,0,0.55)"
            stroke-width="${Math.round(fontSize * 0.08)}" paint-order="stroke">© Howard Tseng</text>
        </svg>`);
      };

      const allFiles = await readdir(contentPhotosDir, { recursive: true, encoding: 'utf8' });
      const yamlFiles = allFiles.filter(f => f.endsWith('.yaml') && !f.endsWith('index.yaml'));

      await Promise.all(yamlFiles.map(async (relPath) => {
        let parsed: Record<string, unknown>;
        try {
          const raw = await readFile(join(contentPhotosDir, relPath), 'utf8');
          parsed = parseYaml(raw) as Record<string, unknown>;
        } catch (err) {
          console.warn(`[photos] Skipping ${relPath}: could not read or parse YAML —`, err);
          return;
        }

        const stem = relPath.replace(/\.yaml$/, '');
        const ext = (parsed.ext as string | undefined) ?? 'jpg';
        const assetPath = join(outputPublicDir, 'photos', `${stem}.${ext}`);
        const existsInOutput = await access(assetPath).then(() => true, () => false);
        if (!existsInOutput) return;

        if (parsed?.hide) {
          try {
            await rm(assetPath);
            console.log(`[photos] Removed hidden asset from output: photos/${stem}.${ext}`);
          } catch (err) {
            console.warn(`[photos] Failed to remove photos/${stem}.${ext} —`, err);
          }
          return;
        }

        try {
          const original = await readFile(assetPath);

          // Resize first and read back the *actual* output size — sharp's fit:'inside'
          // rounds internally, so a size precomputed from the original's metadata can be
          // off by a pixel and make composite() reject the watermark as "too big".
          const { data: resized, info } = await sharp(original)
            .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
            .toBuffer({ resolveWithObject: true });

          // .jpeg()/.toBuffer() without withMetadata() strips EXIF (GPS, camera, etc.) by default.
          const processed = await sharp(resized)
            .composite([{ input: watermarkSvg(info.width, info.height), gravity: 'southeast' }])
            .jpeg({ quality: 82, mozjpeg: true })
            .toBuffer();

          await writeFile(assetPath, processed);
        } catch (err) {
          console.warn(`[photos] Failed to downsize/watermark photos/${stem}.${ext} —`, err);
        }
      }));
    },
  },
  compatibilityDate: '2024-11-01',
});
