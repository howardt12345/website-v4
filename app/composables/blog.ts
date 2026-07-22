import type { Collections } from '@nuxt/content';

export type BlogPost = Collections['blog'];

export interface BlogCategory {
  slug: string;
  name: string;
  subcategories: Array<{ slug: string; name: string }>;
}

const DISPLAY_NAMES: Record<string, string> = {
  engineering: 'Engineering',
  frontend: 'Frontend',
  backend: 'Backend',
  devops: 'DevOps',
  hardware: 'Hardware',
  keyboards: 'Keyboards',
  pcb: 'PCB Design',
  firmware: 'Firmware',
  photography: 'Photography',
  technique: 'Technique',
  gear: 'Gear',
  travel: 'Travel',
  notes: 'Notes',
  reading: 'Reading',
  process: 'Process',
};

const titleCase = (slug: string): string =>
  slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const catName = (slug: string): string => DISPLAY_NAMES[slug] ?? titleCase(slug);

export const subName = (_catSlug: string, subSlug: string): string =>
  DISPLAY_NAMES[subSlug] ?? titleCase(subSlug);

export const blogTaxonomy = (posts: BlogPost[]): BlogCategory[] => {
  const subsByCat = new Map<string, Set<string>>();
  for (const post of posts) {
    if (!post.category) continue;
    const subs = subsByCat.get(post.category) ?? new Set<string>();
    if (post.subcategory) subs.add(post.subcategory);
    subsByCat.set(post.category, subs);
  }
  return [...subsByCat.entries()]
    .map(([slug, subs]) => ({
      slug,
      name: catName(slug),
      subcategories: [...subs]
        .map((s) => ({ slug: s, name: subName(slug, s) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const formatPostDate = (iso: string, locale: string): string =>
  new Date(iso).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

export const slugFromPath = (path: string): string => path.split('/').pop() ?? path;

export const relatedPosts = (post: BlogPost, allPosts: BlogPost[], count = 3): BlogPost[] => {
  const others = allPosts.filter((p) => p.path !== post.path);
  const scored = others.map((p) => {
    const sharedTags = p.tags.filter((t) => post.tags.includes(t)).length;
    const sameCat = p.category === post.category ? 2 : 0;
    const sameSub = p.subcategory === post.subcategory ? 1 : 0;
    return { post: p, score: sharedTags * 2 + sameCat + sameSub };
  });
  scored.sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date));
  return scored.slice(0, count).map((s) => s.post);
};
