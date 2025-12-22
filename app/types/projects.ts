import type { CollectionItemBase } from '@nuxt/content';

export interface ProjectItem extends CollectionItemBase {
  date: string;
  title: string;
  imagePath?: string;
  showInProjects?: boolean;
  featured?: boolean;
  githubLink?: string;
  externalLink?: string;
  tech?: string[];
}