export interface PhotoItem {
  stem: string;
  url: string;
  title?: string;
  caption?: string;
  alt?: string;
  date?: string;
  featured: boolean;
  tags: string[];
  category?: string;
  subcategory?: string;
  /** Width-to-height ratio (e.g. 1.5 for 3:2 landscape). Defaults to 1.5 when not set. */
  aspectRatio: number;
  /** Set for travel photos; undefined for photography/other photos. */
  tripId?: string;
  placeSlug?: string;
}

export interface PhotoCategory {
  category: string;
  count: number;
  /** URL of the cover image — first featured photo in the category, or first photo alphabetically. */
  coverUrl: string;
}
