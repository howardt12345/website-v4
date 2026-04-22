import { defineCollection, defineContentConfig, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string(),
        summary: z.string(),
        date: z.string(),
        readMins: z.number(),
        category: z.string(),
        subcategory: z.string(),
        tags: z.array(z.string()),
        cover: z.object({
          hue: z.number(),
          pattern: z.string(),
        }),
        image: z.string().optional(),
        author: z.string().optional(),
        featured: z.boolean().optional(),
        pinned: z.boolean().optional(),
      }),
    }),
    travelTrips: defineCollection({
      type: 'data',
      source: 'travel/*/index.yaml',
      schema: z.object({
        // Note: `id` is reserved by Nuxt Content — use `stem` for stable trip identification
        title: z.string(),
        countries: z.array(z.string()),
        start: z.string(),
        end: z.string(),
        excerpt: z.string(),
        blogSlug: z.string().optional(),
      }),
    }),
    travelCountries: defineCollection({
      type: 'data',
      source: 'travel/countries/*.yaml',
      schema: z.object({
        iso3: z.string(),
        iso2: z.string(),
        name: z.string(),
        hue: z.number(),
        regions: z.array(z.string()).default([]),
        cities: z.array(z.object({
          id: z.string(),
          name: z.string(),
          lon: z.number(),
          lat: z.number(),
          region: z.string(),
        })).default([]),
      }),
    }),
    travelDays: defineCollection({
      type: 'data',
      source: 'travel/*/days/*.yaml',
      schema: z.object({
        date: z.string(),
        // Day-level defaults. Individual places may override these.
        country: z.string(),
        city: z.string(),
        places: z.array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            lon: z.number(),
            lat: z.number(),
            blogSlug: z.string().optional(),
            // Optional overrides for cross-country or cross-city stops within a day.
            country: z.string().optional(),
            city: z.string().optional(),
          }),
        ),
      }),
    }),
    photos: defineCollection({
      type: 'data',
      source: { include: 'photos/**/*.yaml', exclude: ['photos/**/index.yaml'] },
      schema: z.object({
        title: z.string().optional(),
        caption: z.string().optional(),
        alt: z.string().optional(),
        featured: z.boolean().optional(),
        date: z.string().optional(),
        tags: z.array(z.string()).optional(),
        aspectRatio: z.number().optional(),
        ext: z.string().optional(),
      }),
    }),
    photoFolders: defineCollection({
      type: 'data',
      source: 'photos/**/index.yaml',
      schema: z.object({
        tripId: z.string().optional(),
        placeSlug: z.string().optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
      schema: z.object({
        date: z.string(),
        title: z.string(),
        githubLink: z.string().optional(),
        externalLink: z.string().optional(),
        tech: z.array(z.string()).optional(),
        showInProjects: z.boolean().optional(),
        featured: z.boolean().optional(),
        imagePath: z.string().optional(),
      }),
    }),
    about: defineCollection({
      type: 'page',
      source: 'about/index.md',
      schema: z.object({
        avatar: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        languages: z
          .array(
            z.object({
              name: z.string(),
              value: z.number(),
            }),
          )
          .optional(),
        hobbies: z.array(z.string()).optional(),
      }),
    }),
    experiences: defineCollection({
      type: 'page',
      source: 'about/experiences/**/*.md',
      schema: z.object({
        title: z.string(),
        start_date: z.string(),
        end_date: z.string().optional(),
        organization: z.string().optional(),
        skills: z.array(z.string()).optional(),
        location: z.string().optional(),
        link: z
          .object({
            url: z.string(),
            external: z.boolean(),
          })
          .optional(),
      }),
    }),
  },
});
