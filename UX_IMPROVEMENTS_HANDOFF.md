# UX Improvements — Implementation Handoff

Produced from a full UX review of the site (2026-07-21). This document is the
complete work list: every finding, where it lives, how to fix it, and how to
verify the fix. Items are grouped into workstreams ordered by impact. Each
workstream is independently shippable.

Conventions used below:

- **Problem** — the user-facing symptom.
- **Where** — file/line references (line numbers are as of commit reviewed;
  treat as anchors, not gospel).
- **Fix** — concrete implementation instructions, with code sketches where the
  change is non-obvious. Sketches are directional — adapt to surrounding style.
- **Verify** — how to confirm the fix works.

---

## Workstream 1 — Rendering mode, SEO, and error handling (highest impact)

These all share one root cause (`ssr: false`) or one missing artifact
(`app/error.vue`). Do this workstream first; several later items get easier
after it.

### 1.1 Enable prerendering (fixes blank first paint + social previews + SEO)

**Problem:** With `ssr: false` (`nuxt.config.ts:3`), every visitor stares at a
plain-text "Loading..." Suspense fallback (`app/app.vue:35-44`) until the full
JS bundle boots, and all meta tags are injected client-side — so Slack,
Discord, X, and Facebook unfurlers see an empty `<head>`: no title, no
description, no image, on any page including blog posts.

**Where:** `nuxt.config.ts:3`, `app/app.vue:10-18, 35-44`.

**Fix (preferred):** Keep the SPA runtime behavior but prerender all routes so
served HTML contains real content and meta:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  // remove `ssr: false`
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/blog', '/photography', '/travel', '/app-policy'],
    },
  },
});
```

Notes:
- The site already deploys as static output (`public/_redirects` exists), so
  `nuxt generate` fits the pipeline.
- `@nuxt/content` v3 supports static generation; the sqlite/better-sqlite3
  dependency runs at build time.
- Audit client-only code paths when SSR is turned on: `window`/`document`
  access in `useActiveSection.ts`, `useImageProtection.ts`, the amCharts map
  (wrap in `<ClientOnly>`), `i18next-browser-languagedetector`, and the
  masonry plugin. Wrap or guard with `import.meta.client` as needed.

**Fix (fallback, if SSR migration is too disruptive right now):** stay
`ssr: false` but:
1. Add `spaLoadingTemplate: true` with an `app/spa-loading-template.html`
   containing a branded skeleton (dark background matching the theme, centered
   logo/spinner) so first paint is not a white page with "Loading...".
2. Move static default meta into `nuxt.config.ts` `app.head` (title,
   description, og:*, twitter:*) so crawlers that read raw HTML get at least
   site-level metadata.

**Verify:** `npm run generate`, then inspect `.output/public/blog/<slug>/index.html`
— it must contain the post title/description in `<head>`. Test a link preview
with a local unfurler or https://www.opengraph.xyz against a deploy preview.

### 1.2 Add a default `og:image` and make travel's absolute

**Problem:** `app/app.vue:17` sets `twitterCard: 'summary_large_image'` but no
`ogImage` exists anywhere except `app/pages/travel/index.vue:74` — and that
one is a relative path (`/photos/...`), which Open Graph does not allow.
Result: link previews have no image (or a broken one) everywhere.

**Fix:**
1. Pick/create a site-wide share image (1200×630), put it at
   `public/images/og-default.jpg`.
2. Define the canonical site origin once (e.g. `runtimeConfig.public.siteUrl`
   in `nuxt.config.ts`).
3. In `app/app.vue`'s `useSeoMeta`, add
   `ogImage: `${siteUrl}/images/og-default.jpg``.
4. In `app/pages/travel/index.vue:74`, prefix the existing relative photo path
   with `siteUrl`.
5. In `app/pages/blog/[slug].vue:29-32` add `ogTitle`, `ogDescription`,
   `ogType: 'article'`, and `ogImage` (cover art if the post has one, else the
   default) — posts are the most-shared pages and currently have no og tags.

**Verify:** view generated HTML for a blog post; check `og:image` is an
absolute URL that 200s.

### 1.3 Create `app/error.vue` (branded 404/error page)

**Problem:** No `error.vue` exists anywhere in the repo. Bad URLs and bad blog
slugs (which correctly `throw createError({ statusCode: 404, fatal: true })` at
`app/pages/blog/[slug].vue:18`) land on Nuxt's default unstyled error screen
with no site nav, theme, or way back.

**Fix:** Create `app/error.vue`:

```vue
<script setup lang="ts">
import type { NuxtError } from '#app';
const props = defineProps<{ error: NuxtError }>();
const { t } = useTranslation(); // match the i18n accessor used elsewhere
const handleClearError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="error-page d-flex flex-column align-center justify-center">
    <h1>{{ error.statusCode === 404 ? t('Page not found') : t('Something went wrong') }}</h1>
    <p v-if="error.statusCode !== 404">{{ error.statusMessage }}</p>
    <v-btn color="primary" @click="handleClearError">{{ t('Back to home') }}</v-btn>
  </div>
</template>
```

Style to match the site (reuse `.section-title`, theme colors). Add the new
strings to `public/locales/en/translation.json` (and zh).

**Verify:** visit `/nonsense-url` and `/blog/nonexistent-slug` — both should
show the branded page with a working "Back to home".

### 1.4 Fix soft-404s in `public/_redirects`

**Problem:** Line 1 (`/*  /index.html  200`) matches every path, so line 2
(`/* /index.html 404`) is dead config — every URL returns HTTP 200 and
crawlers index garbage URLs as valid pages.

**Fix:** If prerendering (1.1) lands, most real routes become physical files
and the catch-all can become a 404:

```
/*    /404.html   404
```

(Nuxt prerender emits `404.html` when an error page exists — confirm the file
name in `.output/public/`.) If staying SPA, keep the 200 rewrite but accept
the soft-404 tradeoff and delete the dead second line to avoid confusion.

### 1.5 404 for unknown photography categories

**Problem:** `/photography/asdfgh` renders the raw slug as the page `<h1>`
over an empty grid — no 404, no message.

**Where:** `app/pages/photography/[[category]].vue:37-43` (filter uses raw
param, no existence check), `:90` (renders param as title).

**Fix:** After `allPhotos` resolves, if `category` is non-empty and no photo's
category matches it, `throw createError({ statusCode: 404, statusMessage:
'Photo category not found', fatal: true })`.

**Verify:** `/photography/xyz` shows the branded 404; `/photography/travel`
still works.

### 1.6 Add a sitemap

**Problem:** No sitemap module, no `Sitemap:` line in `robots.txt`. Blog posts
and categories rely purely on internal-link crawling of (today) a JS-rendered
SPA.

**Fix:** `npm i -D @nuxtjs/sitemap`, add to `modules` in `nuxt.config.ts`, set
`site: { url: <siteUrl> }`. With prerendering enabled it will emit
`sitemap.xml` for all crawled routes. Add `Sitemap: <siteUrl>/sitemap.xml` to
`public/robots.txt`.

### 1.7 Set `<html lang>` and keep it in sync with locale

**Problem:** No `htmlAttrs` anywhere; screen readers and search engines get no
language signal, even after switching to Chinese.

**Fix:**
- `nuxt.config.ts`: `app: { head: { htmlAttrs: { lang: 'en' } } }`.
- In `app/store/i18n.store.ts` `changeLanguage` (lines 8-10), after
  `i18next.changeLanguage(...)` add
  `useHead({ htmlAttrs: { lang } })` (or `document.documentElement.lang = lang`
  guarded by `import.meta.client`).

### 1.8 Per-page meta gaps

- `app/pages/photography/[[category]].vue:8-11` — title is always
  "Photography · Howard Tseng"; make it reflect the category:
  ``title: category ? `${capitalize(category)} · Photography · Howard Tseng` : ...``
- `app/pages/app-policy.vue` — no `useSeoMeta` at all; add title/description.

### 1.9 Fix relative favicon path

**Problem:** `app/app.vue:7` uses `href: 'favicon.ico'` (relative), so on
`/blog/some-post` the browser requests `/blog/favicon.ico` and the tab icon
breaks.

**Fix:** change to `href: '/favicon.ico'`.

---

## Workstream 2 — Theme, loading feedback, and global navigation behavior

### 2.1 Persist theme + respect system preference

**Problem:** `app/store/theme.store.ts` only flips in-memory Vuetify state;
`app/plugins/02.vuetify.ts:27` hardcodes `defaultTheme: 'dark'`. Light-theme
users get dark mode again on every reload; system preference is ignored.

**Fix:** rewrite the store:

```ts
// app/store/theme.store.ts
export const useTheme = defineStore('theme', () => {
  const theme = useVuetifyTheme();
  const isDark = computed(() => theme.global.current.value.dark);

  const init = () => {
    const stored = localStorage.getItem('theme'); // 'light' | 'dark' | null
    const system = window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light' : 'dark';
    theme.global.name.value = stored ?? system;
  };

  const toggleTheme = () => {
    const next = isDark.value ? 'light' : 'dark';
    theme.global.name.value = next;
    localStorage.setItem('theme', next);
  };

  return { isDark, toggleTheme, init };
});
```

Call `init()` from a client plugin (or `onMounted` in `app.vue`). To avoid a
flash of wrong theme before hydration, add a tiny inline script in
`app.head.script` (or the SPA loading template) that reads the same
localStorage key and sets a `background-color` / `data-theme` attribute on
`<html>` before the bundle loads.

**Verify:** toggle to light, hard-reload → still light. Clear storage, set OS
to light mode, reload → light by default.

### 2.2 Add global loading indicator + gallery skeletons

**Problem:** No `<NuxtLoadingIndicator />` in `app/app.vue:29-46`; and
`app/pages/photography/[[category]].vue:112-119` renders *nothing* while
`pending` — slow loads look like a broken blank page.

**Fix:**
- Add `<NuxtLoadingIndicator />` as the first child in `app.vue`'s template.
  (Note, under `ssr: false`: this covers *route changes* only — cold boot is the
  `app.vue` Suspense fallback at `:42`. So the blank/"Loading..." first-load
  window is fixed by the branded fallback below, not by `NuxtLoadingIndicator`.)
- In the photography page, render a skeleton grid while pending
  (`v-skeleton-loader type="image"` × ~9 in the masonry container), and an
  empty state ("No photos match these filters" + clear-filters button) when
  the filtered list is empty. The blog list already has an empty state at
  `app/pages/blog/index.vue:123-129` — mirror its pattern.
- Replace the `app.vue` Suspense fallback `<h1>Loading...</h1>` with a
  branded, translated spinner (or remove entirely once 1.1 lands).

### 2.3 Fix active-section highlight dying after navigation

**Problem:** `app/composables/useActiveSection.ts:7-36` creates
IntersectionObservers once in `onMounted`. The header (`nav/links.vue:22`)
lives in the persistent default layout, so after navigating away from `/` and
back — or starting on any other page — the observers point at detached nodes
and the active-link highlight never works again.

**Fix:** In the composable, extract observer setup into a function; call it on
mount **and** in a `watch(() => route.path, ...)` (disconnect old observers
first, re-query the section elements after `nextTick()`). This mirrors what
`app/layouts/default.vue:34` already does for the hero observer.

**Verify:** load `/`, scroll (highlight works) → go to `/blog` → back to `/`
→ scroll: highlight must still track sections.

### 2.4 Fix hash deep-link double-scroll (the 1250 ms yank)

**Problem:** `app/pages/index.vue:11-16` force-scrolls to the hash after a
hardcoded 1250 ms `setTimeout`. On client-side navigation the router's
`scrollBehavior` (`app/router.options.ts:9-16`) has already scrolled, so the
page re-scrolls 1.25 s later, yanking users who started scrolling. On fresh
loads of `/#about`, the user first lands at top, waits, then jumps.

**Fix:**
- Delete the `setTimeout` scroll.
- Scroll when the target actually exists: in `index.vue`'s `onMounted`, after
  `nextTick()`, if `route.hash` and `document.querySelector(route.hash)`
  exists, scroll to it once. If sections mount progressively (behind
  `isMounted`), do it in a `watch(isMounted)` callback after `nextTick`.
- Cancel/skip if the user has already scrolled (`window.scrollY > 0` check or
  a one-time `wheel`/`touchmove` listener that sets an `aborted` flag).

**Verify:** from `/blog`, click a footer/nav link to `/#contact` → lands on
contact once, no second jump. Cold-load `/#about` → lands on About without
the top-then-jump sequence.

### 2.5 Shorten/skip the hero entrance animation on repeat views

**Problem:** On landing at `/`, the sticky header hides while the hero is in
view (`app/layouts/default.vue:15-16`), the hero is gated behind `isMounted`
(`app/pages/index.vue:5,22,24`), and hero nav links animate in with 1250 ms
delay + 150 ms stagger (`app/components/nav/links.vue:36-48`) — no usable
navigation for ~1.3–2.3 s, replayed on *every* return to the home page.

**Fix:** Set a `sessionStorage` flag (`heroIntroPlayed=1`) after the first
play; when present, pass zero delays to the v-motion configs (or skip
`v-motion` entirely). Alternatively keep the top header visible until the hero
nav has finished animating in.

**Verify:** first load animates; navigate to /blog and back → hero renders
instantly with nav usable.

### 2.6 Hidden header must not take keyboard focus

**Problem:** `app/layouts/default.vue:118-121` hides the header with only
`opacity: 0; pointer-events: none`, so Tab moves focus into invisible
controls.

**Fix:** add `visibility: hidden` to the `--hidden` class (add
`transition: visibility` so it doesn't snap), or set `inert` on the header
element when hidden (`:inert="!headerVisible"` — Vue 3.4+ supports it as an
attribute).

**Verify:** on `/` with hero in view, Tab from the address bar — focus should
skip straight to hero content, never vanish.

### 2.7 Mobile drawer active-link logic

**Problem:** `app/layouts/default.vue:52-60` drawer items use `:to` with
default active matching; vue-router ignores hashes, so on `/` all four items
(About/Experience/Projects/Contact) highlight as active simultaneously.

**Fix:** reuse the desktop logic from `app/components/nav/links.vue:56-58`
(`:active-class=""` + explicit `:active="isLinkActive(link)"` computed from
the active-section composable). Consider extracting `isLinkActive` into
`app/composables/links.ts` so both consumers share it.

### 2.8 "Close Filters" must not clear selection + show active filters on deep link

**Problem:** `app/components/common/filters.vue:17-23` — collapsing the filter
panel wipes `selectedTags`; and on a deep link like `/photography?tags=street`
the panel starts collapsed so active filters are invisible.

**Gotcha (verified):** `CommonFilters` has a second consumer the handoff body
omits — `app/components/about/timeline.vue:36` (the home-page Experience
"Filter by Skills"). Any close/clear/init change here also affects that filter;
verify both. The photography page also independently clears `selectedTags` on
category change and pushes `?tags=` to the URL, so the new "Clear" action and
those parent watchers must be coordinated, not left to fight.

**Fix:**
- Remove the selection-clearing from the close handler; add a separate,
  explicit "Clear" action (only enabled when `selectedTags.length > 0`).
- Initialize `showTagsFilter = selectedTags.length > 0`.
- Optionally show a count badge on the "Filters" button when collapsed with
  active tags.

### 2.9 Add `<NuxtLoadingIndicator>`-adjacent cleanups

- **Dead layout:** `app/layouts/index.vue` is referenced by no page and renders
  no header. Delete it (or wire it to the shared header if it's meant to be
  used).
- **Broken focus-color selector:** `app/assets/scss/global.scss:54-62` — the
  nested selector compiles to `.v-btn :hover, :focus .v-btn`, which never
  matches the button itself. Replace with `&:hover, &:focus-visible { color: $accent; }`.

---

## Workstream 3 — Performance

### 3.1 Tree-shake FontAwesome (biggest bundle win)

**Problem:** `app/plugins/01.fontawesome.ts:11-13` does `library.add(fas)`,
`library.add(far)`, `library.add(fab)` — thousands of icons (fas alone is
~1 MB minified) in the main bundle, for a few dozen used.

**Fix:**
1. Inventory used icons: `grep -rhoE "(fa[srb]?|fa-[a-z-]+)" app/ | sort -u`
   plus search for `:icon=` bindings and the `iconsets/custom` usage.
2. Replace the wholesale imports with named imports:

```ts
import { faBars, faCamera, faSun, faMoon /* ... */ } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faInstagram /* ... */ } from '@fortawesome/free-brands-svg-icons';
library.add(faBars, faCamera, faSun, faMoon, faGithub, faLinkedin, faInstagram /* ... */);
```

3. Build and click through every page checking for missing-icon warnings in
   console (`Could not find one or more icon(s)`).

**Verify:** `npx nuxi analyze` (or compare `.output` client bundle sizes)
before/after — expect ≥1 MB reduction in raw JS.

### 3.2 Optimize static images in `public/images/`

**Problem:** The sharp build hook (`nuxt.config.ts:40-113`) processes only
`content/photos`-backed assets; `public/images/` ships raw —
`public/images/projects/keyboard0.jpg` is **2.6 MB**, `public/images/me.jpg`
is **875 KB** (rendered small at `app/components/about/content.vue:43`).

**Fix (either):**
- Extend the existing nitro hook to also downsize `public/images/**` (max edge
  ~1200, quality ~80), or
- One-off recompress the offenders with sharp/squoosh and commit the smaller
  files. `me.jpg` displays at ~300–400 px — a 600 px wide ~60 KB file is
  plenty.

Also consider `@nuxt/image` for automatic `srcset` on these, but that's
optional polish.

### 3.3 Proper webfont setup

**Problem:** Only Poppins-Regular has an `@font-face` — declared **twice**
(`app/assets/scss/global.scss:1-4` and `app/app.vue:50-53`) — as ~145 KB
uncompressed TTF with no `font-display`. The UI uses weights 500/600 (e.g.
`blog/[slug].vue` styles), which browsers fake via synthetic bolding; 8 unused
Poppins TTFs (1.3 MB) sit in `app/assets/fonts/Poppins/`.

**Fix:**
1. Convert Regular, Medium, SemiBold (plus italics only if actually used) to
   woff2 (`npx ttf2woff2` or fonttools).
2. Declare one `@font-face` per weight with `font-display: swap`, in **one**
   place (global.scss); delete the duplicate in `app.vue`.
3. Delete unused TTFs from the repo.

### 3.4 Lazy-load the amCharts map

**Problem:** `app/components/travel/map.vue:2-5` statically imports `am5`,
`am5map`, the Animated theme, and `worldLow` geodata (~1 MB+ parsed) — blocks
the whole `/travel` page chunk even though the timeline below needs none of
it. (Province geodata and `worldHigh` are already dynamic — good.)

**Fix:** In `app/pages/travel/index.vue`, load the map as an async component:

```ts
const TravelMap = defineAsyncComponent(() => import('~/components/travel/map.vue'));
```

Render the existing skeleton as the async component's `loadingComponent` (or
via `<Suspense>` fallback). The page shell, stats, and timeline then render
before amCharts downloads.

### 3.5 Minor

- `app/components/blog/cover-art.vue:13` — raw `<img>`: add `loading="lazy"`
  and explicit `width`/`height` (or keep the aspect-ratio container and just
  add lazy).
- No analytics/error monitoring exists anywhere (verified by grep). Optional:
  add a privacy-friendly analytics (Plausible/Umami) — consistent with the
  site's anti-tracking `robots.txt`/`X-Robots-Tag` posture — and consider
  Sentry (or `nuxt-security`-adjacent logging) so swallowed data-fetch errors
  (see 7.6) become visible.

---

## Workstream 4 — Accessibility pass

### 4.1 aria-labels on all icon-only controls

Add `:aria-label` (i18n'd) to:

| Control | Where |
|---|---|
| Theme toggle (also add `aria-pressed`/dynamic label "Switch to light theme") | `app/components/common/theme-toggle.vue:8-12` |
| Hamburger (also `aria-expanded` bound to drawer state) | `app/layouts/default.vue:65-72` |
| Footer social buttons (use `link.name`, already available) | `app/components/nav/social-links.vue:15-21` |
| Hero mobile nav icon buttons | `app/components/nav/links.vue:62-71` |
| Project link buttons (GitHub/external per project) | `app/components/projects/links.vue:12-27` |
| Experience external-link button | `app/components/about/timeline-content.vue:35-47` |

The travel components and lightbox already do this correctly — copy their
pattern.

### 4.2 Make the language switcher a real control

**Problem:** `app/components/common/language-picker.vue:19-21` renders `<a>`
with no `href`/`tabindex`/`role`/keydown — unreachable by keyboard, invisible
to screen readers. The `<strong>`-vs-normal weight switch also causes a small
layout shift.

**Fix:** render `<button type="button">` per language, `aria-pressed` (or
`aria-current="true"`) on the active one; reserve bold width with
`font-weight` on a fixed-width span or `text-shadow` trick to avoid the shift.

### 4.3 Heading hierarchy on the home page

**Problem:** five `<h1>`s (hero `app/components/home/title.vue:22-30`, plus
`h1.section-title` in `about/content.vue:18`, `about/timeline.vue:34`,
`home/projects.vue:36`, `home/contact.vue:2`); hero also places an `<h2>`
("Hi, I'm") *before* the `<h1>` and marks taglines as `<h2>`.

**Fix:** keep exactly one `<h1>` (the name in the hero). Change
`.section-title` elements to `<h2>` (the CSS class carries the visual style,
so no visual change). Change "Hi, I'm" and the taglines to `<p>`/`<span>`
with the existing classes.

### 4.4 Gallery photo accessibility

**Problem:** `app/components/photos/card.vue:15-27` — `v-img` has no `alt`,
clickable `v-card` has no button semantics/label. Most photo YAMLs also lack
`alt`/`title`, so the lightbox alt fallback (`gallery.vue:15`) is usually
`undefined`.

**Fix:**
- Wrap the card content in a `<button>` (or add `role="button"`, `tabindex="0"`,
  Enter/Space keydown) with `:aria-label="photo.title ?? photo.alt ?? \`${photo.category} photo\`"`.
- Pass `:alt` through to `v-img`.
- Content chore (can be gradual): add `alt`/`title` to photo YAMLs; in the
  meantime derive a fallback alt from category + date so it's never
  `undefined`. The travel photo grids already use proper
  `<button aria-label>` wrappers (`travel/photo-section.vue:78-84`) — copy that.

### 4.5 Reduced motion support

**Problem:** only the travel page checks `prefers-reduced-motion`
(`travel/index.vue:101`). Unconditional: global
`html { scroll-behavior: smooth }` (`global.scss:6-9`), router smooth scroll
(`router.options.ts:12`), hero keyframes (`home/title.vue:121-181`), v-motion
entrances (`pages/index.vue:26-34`, `nav/links.vue:36-48`), TOC smooth scroll
(`blog/toc.vue:59`).

**Fix:**
- CSS: wrap `scroll-behavior: smooth` in
  `@media (prefers-reduced-motion: no-preference) { ... }`; add a global
  `@media (prefers-reduced-motion: reduce) { *, *::before, *::after {
  animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`
  escape hatch.
- JS: create `app/composables/useReducedMotion.ts` returning a ref from
  `useMediaQuery('(prefers-reduced-motion: reduce)')` (VueUse is already a
  dependency); use it to (a) pass `behavior: prefersReduced ? 'auto' : 'smooth'`
  in `router.options.ts` and `toc.vue`, and (b) skip/zero v-motion configs.

### 4.6 Skip-to-content link

**Fix:** in `app/layouts/default.vue` before the header, add
`<a href="#main-content" class="skip-link">Skip to content</a>`; give the
`<main>`/page container `id="main-content"` and `tabindex="-1"`. Style
`.skip-link` visually-hidden until `:focus-visible` (standard pattern).

**Gotcha (verified):** the layout has no `<main>` — it renders `<slot/>` directly
(`default.vue:87`). `pages/index.vue:20` has its own `<main>`, but `blog/[slug].vue`
and other pages use `<div>`. Either wrap the slot in a `<main id="main-content"
tabindex="-1">` in the layout (simplest — one place) or add the id per page. This
same inconsistency also affects 4.3's heading-landmark reasoning.

### 4.7 Light-theme contrast for active nav/accent text

**Problem:** active nav links use primary `#2196F3` on white ≈ 3.1:1 — below
WCAG AA 4.5:1 for small text (`app/assets/theme/theme.ts:1`,
`nav/links.vue:106-108`). Dark theme is fine.

**Gotcha (verified):** `_vars.scss:2` defines `$accent: rgb(var(--v-theme-primary))`,
and the light `info` color also reuses the same `ACCENT` constant (`theme.ts:29`).
Darkening the light `primary` therefore recolors *every* `$accent` usage site-wide
(nav underline, section eyebrows, links, `::selection`), not just nav text — which
is exactly why the separate `primary-text` token below is the safer route.

**Fix:** darken the light theme's primary used *for text* to `#1565C0`-ish
(verify ≥4.5:1 with a contrast checker). If `#2196F3` is wanted for
fills/large elements, introduce a separate `primary-text` token.

### 4.8 Fake-interactive chips (recurring pattern — pick one policy)

**Problem:** chips that look selectable (ripple/hover/selected styling) but do
nothing:
- `about/timeline-content.vue:12,69-84` — `v-chip-group` v-model bound to a
  **setterless computed**; clicks silently no-op.
- `projects/table-row.vue:13-19,30-34` — same pattern.
- `projects/card.vue:43-47` — modelless chip group; chips toggle a highlight
  with zero effect.
- `common/TagChips.vue:12-21` (used on photo cards `photos/card.vue:25-27` and
  the lightbox) — clicks bubble to the card and open the lightbox instead.
- `blog/[slug].vue:78` — post tags. **Correction (verified):** these are plain
  `<v-chip variant="tonal">`, *not* inside a `v-chip-group`, so they are not the
  setterless-computed no-op the others are — they merely look tappable.

**Fix — choose per-site policy, then apply consistently:**
- **Option A (display-only, cheapest):** render plain `v-chip`s *not* inside a
  `v-chip-group`, with `variant="outlined"` and no ripple/hover cursor
  (`:ripple="false"`, `style="pointer-events: none"` or simply a styled
  `<span>`). Do this everywhere above.
- **Option B (wire them up, better UX):** clicking a tech/skill chip applies
  that filter in the section's existing filter state (experience/projects
  already have filter systems); blog post tags navigate to
  `/blog?tags=<tag>` (requires 5.1); photo-card tags emit `@click.stop` and
  toggle the gallery tag filter.

Option B for blog post tags + Option A for the rest is a reasonable split.

### 4.9 Language-proficiency sliders

**Problem:** `app/components/about/skills.vue:45-57` — readonly `v-slider`
with `thumb-size="0"` and non-persistent thumb label: the level text
("Fluent") is effectively never visible, and keyboard users tab into a
readonly slider announcing raw numbers.

**Fix:** render the level as static text next to the language name and make
the bar purely decorative (`aria-hidden="true"`, remove from tab order), or
use `v-progress-linear` with an `aria-label="French: fluent"`.

### 4.10 About portrait

**Problem:** `app/components/about/content.vue:37-44` — portrait `v-img` has
no `alt`, wrapped in an Instagram link with no accessible name; `src="images/me.jpg"`
is relative (breaks off `/`).

**Fix:** `src="/images/me.jpg"`, `alt="Portrait of Howard Tseng"`,
`aria-label="Instagram"` on the link. Consider whether the photo should link
to Instagram at all (unexpected); if kept, add a small hover affordance
(Instagram icon overlay) so the behavior is discoverable.

---

## Workstream 5 — Blog

### 5.1 Sync filter state to the URL (highest-impact blog fix)

**Problem:** All filter state — category, subcategory, tags, search, archive —
lives in plain refs (`app/pages/blog/index.vue:17-21`). Filtered views can't
be shared/bookmarked, and opening a post then pressing Back remounts the page
and wipes everything mid-browse.

**Fix:** Mirror each piece of state into `route.query` and hydrate from it:

```ts
const route = useRoute();
const router = useRouter();

const selectedCategory = computed({
  get: () => (route.query.category as string) ?? null,
  set: (v) => router.replace({ query: { ...route.query, category: v || undefined } }),
});
// same pattern for subcategory, tags (comma-joined), q (search), archive
```

Use `router.replace` (not `push`) so each keystroke/toggle doesn't spam
history. Debounce the search input's writes (~300 ms) with `useDebounceFn`
(already available from the installed `@vueuse/core`). VueUse's `useRouteQuery`
from `@vueuse/router` does exactly this, but that subpackage is **not currently
installed** — `npm i @vueuse/router` first, or hand-roll `route.query`
get/set computeds.

**Verify:** apply filters + search → copy URL into a new tab → identical
view. Open a post, press Back → filters intact.

### 5.2 Mobile: filters before content

**Problem:** below 960 px the grid collapses to one column with the sidebar
first (`app/pages/blog/index.vue:214-223`,
`blog/sidebar-filters.vue:155-157`) — users scroll past the full category
list, tag cloud, and archive to reach the first post.

**Fix (either):**
- CSS-only: on the mobile breakpoint set `order: 2` on the sidebar container
  and `order: 1` on the post list (grid/flex `order`), or
- Better: wrap the sidebar in a `v-expansion-panel`/disclosure ("Filters (3)")
  on mobile, collapsed by default, showing an active-filter count.

### 5.3 TOC: update the URL hash + provide mobile TOC

**Problem:** `blog/toc.vue:75,58-60` — links use `@click.prevent` +
`scrollIntoView`, so the hash never changes (no deep-linking a section, Back
doesn't restore position). And the TOC is `display: none` below 1200 px
(`toc.vue:94-96`) — tablet/phone readers get no in-page navigation.

**Fix:**
- On click: `history.pushState(null, '', '#' + id)` (or
  `router.push({ hash })` with `scrollBehavior` handling it) *then* smooth
  scroll — respecting reduced motion per 4.5.
- Mobile: render the same TOC list inside a collapsed
  `v-expansion-panel` ("On this page") between the post header and body when
  `< 1200px`. The `aria-label="On this page"` at `toc.vue:64` is hardcoded
  English — run it through `$t` (key already exists in en JSON).
- Optional polish: heading anchor links (visible `#` on hover) via a small
  directive or `@nuxt/content`'s anchor settings.

### 5.4 Reading-progress bar hidden behind the header

**Problem:** `blog/reading-progress.vue` is `fixed; top: 0; z-index: 99`
(the `.reading-progress` rule is lines 25-35; `z-index: 99` is on line 32)
while the sticky header is `z-index: 100` with 85 %-opacity glass
(`_vars.scss:8`) — the bar renders dimmed/blurred *under* the nav.

**Fix:** either bump the bar to `z-index: 101`, or (nicer) pin it to the
header's bottom edge: `top: var(--nav-height)` (there's an SCSS `$nav-height`
— expose it as a CSS var or reuse the SCSS var in this component).

### 5.5 Prev/next post navigation

**Problem:** post pages have only algorithmic "Related reading" — no
chronological prev/next, though `allPosts` is already fetched
(`blog/[slug].vue:14`).

**Fix:** from the sorted-by-date list, find the current index and render a
two-cell footer nav (`← older | newer →`) with post titles. Handle first/last
(render only one side). The list is pre-sorted date DESC, so `index - 1` is
newer and `index + 1` is older; match the current post via
`path === `/blog/${slug}`` and build links with `slugFromPath` (`blog.ts:65`).

**Gotcha (verified):** only one post exists today (`content/blog/placeholder.md`),
so prev/next (and Related) render empty until more posts land — test with mocked
data.

### 5.6 Small blog fixes

- **Taxonomy validation:** `content/blog/placeholder.md:7` uses
  `subcategory: 'misc'` which doesn't exist under `notes` in `BLOG_CATEGORIES`
  (`composables/blog.ts:40-46`) → UI shows raw slug and no filter can select
  it. Add subcategory validation to the content schema in `content.config.ts`
  (enum per category), and fix the placeholder.
- **Category display names bypass i18n** (`composables/blog.ts:11-47` —
  "Engineering", "PCB Design", …). Either run through `$t` at render sites or
  accept as intentional (they're proper nouns-ish); decide and document.
- **Tag reset on category switch** (`blog/index.vue:60-64`): switching
  category silently discards selected tags. Either scope tags per category
  visually, or keep tags and show zero-result empty state.
- **Pluralization:** result count at `blog/index.vue:103` has no singular form
  ("1 of 12 posts") — use i18next plurals (`_one`/`_other` keys).
- **Broken hover border:** `blog/featured-card.vue:59` sets
  `border-color: rgb(var(--v-border-opacity))` — that variable is an opacity
  scalar, not a color triple; the hover border never renders. Use
  `rgba(var(--v-border-color), var(--v-border-opacity))` or a theme color.
- **Nav link:** blog is commented out of the nav (`composables/links.ts:15-16`).
  Presumably intentional dark-launch — re-enable when ready; everything above
  should land first.

---

## Workstream 6 — Photography & lightbox

### 6.1 Category card click appears to do nothing (bug)

**Problem:** From the "Show Categories" view, clicking a category navigates to
`/photography/<cat>` but the reused page component keeps
`showCategoriesView = true` — the categories grid stays on screen; only the
title changes (`[[category]].vue:82`, `photos/categories.vue:23`).

**Fix (verified):** the watcher already exists at `[[category]].vue:55` and
watches the `category` computed (it currently clears `selectedTags`). Add one
line to it — no new `route.params` watcher needed:

```ts
watch(category, () => {
  selectedTags.value = [];        // existing behavior
  showCategoriesView.value = false;
});
```

**Verify:** open categories view → click a category → photo grid for that
category appears.

### 6.2 Back button vs tag filters (bug)

**Problem:** every chip toggle does `router.push({ query })`
(`[[category]].vue:60`) creating a history entry, but `route.query.tags` is
only read in `onMounted` (`:47`) — pressing Back changes the URL without
updating chips or grid; Back appears broken and must be pressed once per
toggled chip.

**Fix:** same pattern as 5.1 — make `selectedTags` a computed with
get-from-`route.query`/set-via-`router.replace`. `replace` (not `push`) keeps
history clean; the get side makes Back/Forward actually re-render.

**Verify:** toggle 3 tags, press Back once → leaves the page (or steps to the
pre-filter state, depending on chosen semantics) with UI and URL in agreement.

### 6.3 Lightbox: history integration + deep-linking

**Problem:** `PhotoLightbox.vue:49-53` — browser/Android Back while the
lightbox is open navigates the route (leaving the page) instead of closing the
overlay; a specific photo can't be linked/shared.

**Fix:** on open, `router.push({ query: { ...route.query, photo: stem } })`;
watch `route.query.photo` — open the dialog when set (this also gives free
deep-linking on page load), close when cleared. Closing via Esc/X should
`router.back()` if the entry was pushed by us, else `router.replace` clearing
the param. Test interaction with 6.2's query handling (both live in
`route.query` — merge, don't clobber).

**Gotcha (verified):** `PhotoLightbox` is shared by three consumers —
`photos/gallery.vue:64`, `travel/photo-section.vue:97`, `travel/timeline.vue:132`
— and a travel city view mounts several instances at once (see 7.6b). A single
global `route.query.photo` scheme will collide across instances: scope the
deep-link to the gallery consumer (or key it per instance). Also `LightboxEntry`
(`app/types/ui.ts`) has no stable id/`stem` today — add one and populate it in
all three consumers.

### 6.4 Lightbox: swipe + loading + preloading

**Where:** `PhotoLightbox.vue:66-72, 88-110`.

**Fix:**
- **Swipe:** VueUse `useSwipe` on the image container; `left → next`,
  `right → prev`. `@vueuse/core` is installed, but there is no `@vueuse/nuxt`
  auto-import module — `import { useSwipe } from '@vueuse/core'` explicitly.
- **Loading feedback:** use `v-img`'s `#placeholder` slot with
  `v-progress-circular indeterminate` so switching photos on slow connections
  shows feedback instead of a blank pane.
- **Preload neighbors:** on index change,
  `[currentIndex - 1, currentIndex + 1].forEach(i => { const p = photos[i]; if (p) new Image().src = p.src; })`.

### 6.5 Higher-resolution lightbox renditions

**Problem:** the build hook caps images at 800 px max-edge (`nuxt.config.ts:51`)
but the lightbox dialog is `max-width="900"` — hero photos render
upscaled/soft on desktop, on a *photography portfolio*. Also: the downsizing
happens only in `nitro:build:public-assets`, so `nuxt dev` (or any deploy that
serves raw `public/`) ships the 3–4 MB originals (250 MB total).

**Fix:**
1. In the build hook, emit two renditions per photo: thumbnail (~800 px, for
   masonry) and large (~1600–2000 px, for lightbox), e.g. `stem.jpg` +
   `stem@2x.jpg`; keep the watermark step for both.
2. Update `composables/photos.ts` to expose both URLs; masonry cards use the
   small, lightbox uses the large (`v-img :src` large, `:lazy-src` small gives
   a nice progressive load).
3. Bound the dialog image to its natural size to avoid upscaling.
4. Dev-mode note: acceptable to keep originals in dev, but document it; or
   cache processed output to avoid reprocessing 250 MB every build.

### 6.6 Photography page polish

- **Title shows raw slug** (`[[category]].vue:90`): "travel" lowercase as the
  `<h1>`. Capitalize for display (`text-transform: capitalize` on the class or
  a `capitalize()` util — the breadcrumb already capitalizes; reuse that).
- **Self-linking breadcrumb** (`:77-80`): last crumb links to the current
  page. Set `disabled: true` on the last item (Vuetify renders it
  non-interactive with `aria-current`).

### 6.7 Reconsider global image right-click blocking

**Problem:** `useImageProtection.ts` (wired site-wide in `app.vue:26`) blocks
`contextmenu` on every `<img>` — breaking open-in-new-tab / copy-address /
Android long-press-share on *all* images including blog and project ones —
while providing no real protection (drag-save and devtools still work). The
build-time watermarking already addresses the actual concern.

**Fix (owner's call):** preferred — remove the composable entirely. Minimum —
scope it to gallery/lightbox images only (attach on a container ref instead of
document-wide), leaving blog/project images normal.

---

## Workstream 7 — Travel

(Travel is the strongest section already — URL-hash state restore, map
skeleton, labeled zoom controls all verified good. These are the gaps.)

### 7.1 Mobile scroll trap on the map

**Problem:** `map.vue:616-623` — `panX`/`panY` always active and
`tapToActivate` not enabled; on the 300 px-tall full-width mobile map
(`travel/index.vue:316-318`), vertical swipes pan the map instead of scrolling
the page — users can get stuck.

**Fix:** after `am5.Root.new(el)`:

```ts
root.tapToActivate = true;
root.tapToActivateTimeout = 3000; // deactivates after inactivity
```

amCharts then shows its own "tap to interact" affordance on touch devices and
lets page scroll pass through until activated.

### 7.2 Map error state

**Problem:** `chartReady` only flips on `frameended` (`map.vue:626`), and
`loadPolygons`' dynamic imports (`worldHigh`, province geojson, `map.vue:488-601`)
have no `catch` — a failed/blocked chunk leaves the skeleton spinning forever.

**Fix:** wrap `buildChart`/`loadPolygons` bodies in try/catch; on error (or a
~15 s timeout without `frameended`), set an `error` ref and render a static
fallback panel in place of the skeleton: "Map unavailable — use the timeline
below" (i18n'd), keeping stats and timeline fully usable.

### 7.3 Communicate Ctrl+scroll zoom

**Problem:** wheel zoom requires Ctrl/Cmd (`map.vue:631-633`) but nothing says
so — users conclude the map can't be zoomed by wheel.

**Fix:** listen for plain (unmodified) `wheel` events over the map container;
show a transient overlay ("Use Ctrl + scroll to zoom" / ⌘ on Mac, i18n'd) that
fades after ~1.5 s. This is the standard Google-Maps-embed pattern. amCharts
has `wheelable` hint options; a simple absolutely-positioned div is fine too.

### 7.4 Back-button granularity for day navigation

**Problem:** day/stop/city-within-trip navigation uses `router.replace`
(`travel.store.ts:216,229,237`) — after browsing several days, one Back exits
the trip entirely; mis-clicks can't be undone with Back.

**Fix:** switch **day** changes (and city changes) to `router.push`; keep
`replace` for stop-level changes to avoid history spam. Sanity-check the
`parseHash`/`applyHash` flow handles Forward correctly too.

### 7.5 Mobile stats overlay

**Problem:** on ≤600 px the stats bar pins to the bottom of the already-short
300 px map, covering ~20 % of it, with 10 px uppercase labels
(`travel/index.vue:350-361`).

**Fix:** on the mobile breakpoint, render the stats bar as a normal block
*below* the map instead of an overlay (conditional class / teleport), and let
labels use ≥12 px.

### 7.6 Small travel fixes

- **Empty timeline renders nothing:** `trip-overview.vue:59` renders
  `TravelTimeline` without `emptyText`, so a trip with no logged entries shows
  literally nothing under "All photos". Pass an `emptyText` like the city view
  does.
- **Per-day lightboxes in city view:** `city-view.vue:62-67` — each date group
  instantiates its own lightbox, so arrows can't traverse the whole city's
  photos. Hoist a single lightbox to city-view with a flattened list; reuse
  the `entryOffsets` pattern `timeline.vue` already uses internally.
- **Swallowed fetch errors (site-wide, noted here for the store):** no
  `useAsyncData` destructures `error` (`composables/photos.ts:27-34`,
  `store/travel.store.ts:94-104`, blog pages) — a failed content load renders
  empty pages with no message. Destructure `error` and render a simple retry
  panel in each consumer.

---

## Workstream 8 — i18n

### 8.1 Chinese locale: complete it or hide it

**Problem (verified):** `public/locales/en/translation.json` has **121 keys**;
`public/locales/zh/translation.json` has **4** — and 2 of those 4 are still
English ("Freelance Photographer", "Full-Stack Developer"). Selecting 國語
changes the hero greeting and nothing else (`fallbackLng: 'en'`,
`03.i18n.ts:19`).

**Fix:** two acceptable end states — pick one:
- **A. Complete it:** translate the 117 missing keys. Generate the worklist:
  ```bash
  node -e "const en=require('./public/locales/en/translation.json'),zh=require('./public/locales/zh/translation.json');console.log(JSON.stringify(Object.fromEntries(Object.keys(en).filter(k=>!(k in zh)).map(k=>[k,en[k]])),null,2))" > zh-missing.json
  ```
  Mind i18next plural suffixes (`_one`/`_other`) and interpolations
  (`{{n}} min read`). Chinese generally needs only `_other`.
- **B. Hide until ready:** remove zh from `SUPPORTED_LANGUAGES`
  (`app/plugins/03.i18n.ts:6-13`). **Correction (verified):** the picker does
  *not* hide automatically, and `SUPPORTED_LANGUAGES` is an object (a
  `Record`, no `.length`). `app/components/common/language-picker.vue:5,15`
  does `Object.entries(SUPPORTED_LANGUAGES)` and renders a lone bold label
  when one entry remains. Gate it explicitly inside the picker:
  `v-if="languageEntries.length > 1"`.

Also fix the label typo at `03.i18n.ts:11`: `'國語 (臺灣）'` mixes half-width
`(` with full-width `）` — make both full-width `（臺灣）` or both half-width.

### 8.2 Disable `saveMissing` in production + secure/remove the write endpoint

**Problem:** `03.i18n.ts:25-26` (`saveMissing: true, saveMissingTo: 'current'`)
ships to production — every zh visitor fires up to ~117 POSTs to
`/locales/add/zh/translation`. The handler
(`server/routes/locales/add/[locale]/translation.ts`) does
`readFileSync`/`writeFileSync` on the live translation file with the raw
request body merged in — **no auth, no validation**; an unknown locale throws
an unhandled exception (500). If deployed via `npm run deploy`
(`node .output/server/index.mjs`), anyone on the internet can overwrite the
site's translation files.

**Fix:**
1. `saveMissing: import.meta.dev` in the i18next init options.
2. In the server route: early-return 404 when `!import.meta.dev`; whitelist
   `locale` against `SUPPORTED_LANGUAGES`; wrap fs ops in try/catch; validate
   the body is a flat string→string object.
3. If prerendering (1.1) makes the deploy fully static, the route never runs
   in prod — but keep the guards anyway for the node-server path.

### 8.3 Hardcoded English strings

- `app/app.vue:42` — Suspense fallback `Loading...` (first thing every user
  sees). i18n is not ready at that point in the tree — either replace with a
  language-neutral spinner (recommended) or the SPA loading template from 1.1.
- `app/components/blog/toc.vue:64` — `aria-label="On this page"`: use `$t`
  (key exists in en JSON; the same file already uses `$t` elsewhere).
- `app/composables/date.ts:24` — "Present" in experience date ranges: add a
  translation key.
- `app/pages/app-policy.vue` — whole page untranslated; acceptable for a legal
  page — decide and move on.

### 8.4 First-paint blocking on locale fetch

**Problem:** top-level `await i18nextPromise` in `app/app.vue:22` makes the
root component async — with `ssr: false` the user sees nothing until the
locale JSON downloads over HTTP.

**Fix:** bundle the English catalog as the init `resources` (static import of
`en/translation.json`) so i18next initializes synchronously, and let
`i18next-http-backend` lazy-load only non-English locales (`partialBundledLanguages: true`).
Then drop the top-level `await`. (If 1.1's prerender lands, this matters less
but is still a win for time-to-interactive.)

---

## Suggested sequencing

| Phase | Items | Rationale |
|---|---|---|
| 1 | 1.1–1.9 (rendering/SEO/error), 8.2 (security-adjacent) | Fixes first paint, sharing, 404s; closes the open write endpoint |
| 2 | 2.1, 3.1 (theme persistence, FontAwesome) | Cheap, high-visibility wins |
| 3 | 6.1, 6.2, 5.1 (photography nav bugs, blog URL sync) | Closest to outright broken behavior |
| 4 | Workstream 4 (accessibility pass) | Mechanical, wide-surface, low-risk |
| 5 | 6.3–6.5, 5.2–5.5 (lightbox + blog polish) | Feature-level improvements |
| 6 | Workstream 7 (travel), 3.2–3.4 (images/fonts/amcharts) | Section polish + perf |
| 7 | 8.1, 8.3, 8.4 (i18n completion) | Content-heavy; can run in parallel with any phase |

## Verified-good (do not "fix")

- Travel URL-hash state restore (`travel.store.ts` `parseHash`/`applyHash`)
- Masonry aspect-ratio height reservation (no CLS from gallery images)
- Blog empty state + clear-filters action (`blog/index.vue:123-129`)
- UTC-safe blog date formatting (no off-by-one-day bug)
- Whole blog cards as single `NuxtLink`s
- Language persistence via i18next language detector (localStorage)
- Global `:focus-visible` outlines (`global.scss:48-52`)
- `scroll-padding-top: $nav-height` for anchor offset
- Drawer auto-close on navigation
- Build-time photo watermark/downsize pipeline for `content/photos`
- `robots.txt` AI-crawler blocking + `X-Robots-Tag: noai` (intentional)
