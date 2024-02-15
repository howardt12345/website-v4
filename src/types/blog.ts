
interface BlogEntry {
  id: string;
  created_time: string;
  last_edited_time: string;
  category: string[];
  title: string;
  thumbnail?: string;
  tags: string[];
}

interface BlogPage {
  info: BlogEntry;
  content: string;
}