// https://nuxt.com/docs/api/configuration/nuxt-config
import { theme_light, theme_dark } from './app/assets/theme/theme';

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      script: [
        {
          // Prerendered HTML is always dark; set the real theme before first paint so a light preference doesn't flash.
          // ponytail: background-only; a data-theme CSS-var layer would also kill the brief component recolor at hydration.
          innerHTML:
            `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t;document.documentElement.style.backgroundColor=t==='light'?'${theme_light.colors.background}':'${theme_dark.colors.background}'}catch(e){}`,
          tagPosition: 'head',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://howardt12345.com',
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/blog', '/photography', '/travel', '/app-policy'],
      failOnError: true,
    },
  },
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
    'nitro:init': async (nitro) => {
      const { writeFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const base = (process.env.NUXT_PUBLIC_SITE_URL || 'https://howardt12345.com').replace(/\/$/, '');
      const REDIRECTS = new Set(['/about', '/experience', '/projects', '/contact']);
      const routes = new Set<string>();

      // Rewritten per route because `nuxt generate` fires no terminal prerender
      // hook; the handler stays synchronous so parallel routes can't interleave.
      nitro.hooks.hook('prerender:generate', (route) => {
        if (
          !route.fileName?.endsWith('.html') ||
          route.route.includes('?') ||
          ['/200.html', '/404.html'].includes(route.route) ||
          REDIRECTS.has(route.route)
        ) {
          return;
        }
        routes.add(route.route);
        const urls = [...routes]
          .sort()
          .map((r) => `  <url><loc>${base}${r === '/' ? '/' : r}</loc></url>`)
          .join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        writeFileSync(join(nitro.options.output.publicDir, 'sitemap.xml'), xml);
      });
    },
    // Category pages are only linked from a toggled-in view, so crawlLinks can't
    // find them; enumerate from content so a cold /photography/<cat> link isn't a 404.
    'nitro:config': async (nitroConfig) => {
      const { readdir, readFile } = await import('node:fs/promises');
      const { resolve, join } = await import('node:path');
      const { parse: parseYaml } = await import('yaml');

      const photosDir = resolve(process.cwd(), 'content/photos');
      let indexFiles: string[] = [];
      try {
        const all = await readdir(photosDir, { recursive: true, encoding: 'utf8' });
        indexFiles = all.filter((f) => f.endsWith('index.yaml'));
      } catch {
        return;
      }

      const categories = new Set<string>();
      await Promise.all(
        indexFiles.map(async (rel) => {
          try {
            const parsed = parseYaml(await readFile(join(photosDir, rel), 'utf8')) as { category?: string };
            if (parsed?.category) categories.add(parsed.category);
          } catch {
            // ignore unreadable/malformed folder metadata
          }
        }),
      );

      nitroConfig.prerender ??= {};
      nitroConfig.prerender.routes ??= [];
      nitroConfig.prerender.routes.push(...[...categories].map((c) => `/photography/${c}`));
    },
    'nitro:build:public-assets': async (nitro) => {
      const { readdir, readFile, writeFile, rm, access, stat } = await import('node:fs/promises');
      const { join, resolve } = await import('node:path');
      const { parse: parseYaml } = await import('yaml');
      const { default: sharp } = await import('sharp');

      const contentPhotosDir = resolve(process.cwd(), 'content/photos');
      const outputPublicDir = nitro.options.output.publicDir;

      // Public photos get downsized + watermarked so a scrape only nets a
      // web-res, marked copy — never the full-res original. Two renditions per
      // photo: a masonry thumb and a larger one for the lightbox (stem@2x).
      const THUMB_EDGE = 800;
      const LARGE_EDGE = 1600;
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

      // Resize first and read back the *actual* output size — sharp's fit:'inside'
      // rounds internally, so a size precomputed from the original's metadata can be
      // off by a pixel and make composite() reject the watermark as "too big".
      const renderRendition = async (original: Buffer, maxEdge: number) => {
        const { data: resized, info } = await sharp(original)
          .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
          .toBuffer({ resolveWithObject: true });
        // .jpeg()/.toBuffer() without withMetadata() strips EXIF (GPS, camera, etc.) by default.
        return sharp(resized)
          .composite([{ input: watermarkSvg(info.width, info.height), gravity: 'southeast' }])
          .jpeg({ quality: 82, mozjpeg: true })
          .toBuffer();
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
          const largePath = join(outputPublicDir, 'photos', `${stem}@2x.${ext}`);
          const [thumb, large] = await Promise.all([
            renderRendition(original, THUMB_EDGE),
            renderRendition(original, LARGE_EDGE),
          ]);
          await Promise.all([writeFile(assetPath, thumb), writeFile(largePath, large)]);
        } catch (err) {
          console.warn(`[photos] Failed to downsize/watermark photos/${stem}.${ext} —`, err);
        }
      }));

      // public/images bypasses the content-photos pipeline and ships raw; downsize the
      // oversized ones so a page doesn't pull a multi-MB screenshot or portrait.
      const imagesDir = join(outputPublicDir, 'images');
      const MAX_IMAGE_EDGE = 1600;
      const RECOMPRESS_MIN_BYTES = 150_000;
      let imageFiles: string[] = [];
      try {
        imageFiles = (await readdir(imagesDir, { recursive: true, encoding: 'utf8' }))
          .filter((f) => /\.jpe?g$/i.test(f));
      } catch {
        imageFiles = [];
      }

      await Promise.all(imageFiles.map(async (rel) => {
        const abs = join(imagesDir, rel);
        try {
          const { size } = await stat(abs);
          if (size < RECOMPRESS_MIN_BYTES) return;
          const optimized = await sharp(await readFile(abs))
            .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 82, mozjpeg: true })
            .toBuffer();
          if (optimized.length < size) await writeFile(abs, optimized);
        } catch (err) {
          console.warn(`[images] Failed to optimize images/${rel} —`, err);
        }
      }));
    },
  },
  compatibilityDate: '2024-11-01',
});
