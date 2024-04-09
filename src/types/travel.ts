import { ParsedContent } from "@nuxt/content/dist/runtime/types";

export interface TravelItem extends ParsedContent {
  visited: string[];
}