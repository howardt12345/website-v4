import { ParsedContent } from "@nuxt/content/dist/runtime/types";

export interface TimelineItem extends ParsedContent {
  title: string;
  start_date: Date;
  organization?: string;
  skills?: string[];
  location?: string;
  end_date?: Date;
  link?: {
    url: string;
    external: boolean;
  };
}