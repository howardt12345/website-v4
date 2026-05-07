import type { PageCollectionItemBase } from '@nuxt/content';
import { usei18n } from '~/store/i18n.store';

export interface BlogPost extends PageCollectionItemBase {
  summary: string;
  date: string;
  readMins: number;
  category: string;
  subcategory: string;
  tags: string[];
  cover: { hue: number; pattern: string };
  image?: string;
  author?: string;
  featured?: boolean;
  pinned?: boolean;
}

export interface BlogCategory {
  slug: string;
  name: string;
  subcategories: Array<{ slug: string; name: string }>;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    slug: 'engineering',
    name: 'Engineering',
    subcategories: [
      { slug: 'frontend', name: 'Frontend' },
      { slug: 'backend', name: 'Backend' },
      { slug: 'devops', name: 'DevOps' },
    ],
  },
  {
    slug: 'hardware',
    name: 'Hardware',
    subcategories: [
      { slug: 'keyboards', name: 'Keyboards' },
      { slug: 'pcb', name: 'PCB Design' },
      { slug: 'firmware', name: 'Firmware' },
    ],
  },
  {
    slug: 'photography',
    name: 'Photography',
    subcategories: [
      { slug: 'technique', name: 'Technique' },
      { slug: 'gear', name: 'Gear' },
      { slug: 'travel', name: 'Travel' },
    ],
  },
  {
    slug: 'notes',
    name: 'Notes',
    subcategories: [
      { slug: 'reading', name: 'Reading' },
      { slug: 'process', name: 'Process' },
    ],
  },
];

export const catName = (slug: string): string =>
  BLOG_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

export const subName = (catSlug: string, subSlug: string): string => {
  const cat = BLOG_CATEGORIES.find((c) => c.slug === catSlug);
  return cat?.subcategories.find((s) => s.slug === subSlug)?.name ?? subSlug;
};

export const formatPostDate = (iso: string): string => {
  const { currentLanguage } = storeToRefs(usei18n());
  return new Date(iso).toLocaleDateString(currentLanguage.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

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
