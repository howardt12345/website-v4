import type { CollectionItemBase } from '@nuxt/content';

export interface TimelineItem extends CollectionItemBase {
  title: string;
  start_date: string;
  organization?: string;
  skills?: string[];
  location?: string;
  end_date?: string;
  link?: {
    url: string;
    external: boolean;
  };
}