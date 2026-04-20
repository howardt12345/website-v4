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
