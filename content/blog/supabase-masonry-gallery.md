---
title: 'Building a filterable masonry gallery with Supabase'
summary: "The photography side of the site needed tag-filtering, instant search and row-balancing across 400+ images. Here's the schema and the query plan."
date: '2026-01-30'
readMins: 8
category: 'engineering'
subcategory: 'backend'
tags: ['Supabase', 'Postgres', 'Photography', 'Vue']
cover:
  hue: 160
  pattern: 'wave'
author: 'Howard Tseng'
---

Masonry layouts are deceptively hard to do well. The visual challenge is row balancing; the data challenge is keeping filtering fast when your image count climbs past a few hundred.

## Background

The photography section of this site started as a flat JSON file. That worked fine at 80 images. At 400, the bundle size became awkward and tag filtering required loading everything before any filtering could happen.

## Approach

The schema is simple: one `photos` table with `id`, `url`, `category`, `tags` (text array), `width`, `height`, `taken_at`. The tags column is a `text[]` with a GIN index — this makes array-contains queries fast even at scale.

### The query

Filtering by multiple tags uses Postgres's `@>` operator (array contains all):

```sql
SELECT * FROM photos
WHERE tags @> ARRAY['street', 'tokyo']
ORDER BY taken_at DESC;
```

From the Vue client via Supabase JS:

```ts
const { data } = await supabase
  .from('photos')
  .select('*')
  .contains('tags', selectedTags.value)
  .order('taken_at', { ascending: false })
```

### Trade-offs

- A GIN index on the tags column added 12MB to the database size — worth it for sub-10ms filter queries
- I denormalized `width` and `height` into the table to avoid a second round-trip for layout calculation; this means updating them if I ever re-export at different sizes
- The masonry layout itself runs client-side using a Vue plugin; server-side layout calculation would be ideal but adds complexity I don't need yet

## Outcome

Filter queries run in under 15ms on the Supabase free tier. The masonry layout rebalances in a single `nextTick` after results change. The bundle no longer includes image metadata.

## What's next

Row-level security so I can mark photos as draft without a separate table. And eventually, a lightbox that pre-fetches the next image while the current one is open.
