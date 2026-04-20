---
title: 'Rebuilding my portfolio on Nuxt 4'
summary: "Notes from the fourth rewrite — why I left Next.js behind, what I gained from Vue's composition API, and how the migration actually went."
date: '2026-03-14'
readMins: 9
category: 'engineering'
subcategory: 'frontend'
tags: ['Nuxt', 'Vue', 'Migration', 'TypeScript']
cover:
  hue: 190
  pattern: 'diag'
author: 'Howard Tseng'
featured: true
pinned: true
---

The first three iterations of this site taught me something: the framework is the least interesting decision. What matters is the shape of the content — how posts, projects and photos relate — and how friction-free it is to add a new one six months from now.

## Why rewrite at all?

v3 was fine. It loaded fast, looked clean, and the CMS worked. But every time I wanted to add a new kind of content — photo sets, talks, reading lists — I had to reach deep into the theme and untangle three layers of abstractions I'd built when I was in a different mood.

So v4 has one rule: every new content type should be one schema file and one template file. Nothing else.

## Picking Nuxt

I evaluated Astro, Next 15, SvelteKit and Nuxt 4. They're all good. Nuxt won because I'd been quietly building more Vue than React over the last year and the ergonomics of `<script setup>` finally outpace what I get from RSC for the kind of content-heavy site this is.

### What I miss from Next

- Server actions feel more mature
- The React Compiler is doing real work
- TypeScript inference in tRPC is still unmatched

### What I gained from Nuxt

- `useFetch` caching is dead simple
- Vue's template compiler catches a class of bugs I used to ship
- i18n support is first-class, not a plugin-shaped afterthought

## The migration, briefly

I ported one page at a time, oldest-first, behind a feature flag. The whole thing took four evenings. 70% of the work was rewriting React hooks as Vue composables; 20% was CSS drift; 10% was me finally fixing things I'd been avoiding for a year.

## Verdict

I'll do another rewrite eventually. They all have a half-life. But this one fits the shape of the content I actually make, which is the closest I've come to a portfolio I don't want to rewrite.
