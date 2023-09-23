export interface PhotoItem {
  id: string;
  name: string;
  blurb: string;
  date: string;
  url: string;
  width: number;
  height: number;
  category: string;
  tags: string[];
}

export interface PhotoCategory {
  category: string;
  url: string;
  count: number;
}