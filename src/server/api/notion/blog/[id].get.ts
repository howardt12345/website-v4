import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { toBlogEntry } from '@/utils/blog';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

// cache the markdown string for a page in a map
const pageCache = new Map<
  string,
  {
    page: BlogPage;
    lastFetched: number;
  }
>();

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? '';

  const fetchPage = async (id: string): Promise<BlogPage> => {
    const page = await notion.pages.retrieve({ page_id: id });
    const mdBlocks = await n2m.pageToMarkdown(id);
    const mdString = n2m.toMarkdownString(mdBlocks);
    return {
      info: toBlogEntry(page),
      content: mdString.parent,
    };
  };

  let page = pageCache.get(id);
  if (!page || new Date().getTime() - page.lastFetched > 1) {
    page = {
      page: await fetchPage(id),
      lastFetched: new Date().getTime(),
    };
    pageCache.set(id, page);
  }

  return {
    status: 200,
    body: page,
  };
});
