import { Client } from '@notionhq/client';
import { toBlogEntry } from '@/utils/blog';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const blog_database_id = process.env.NOTION_DATABASE_ID ?? '';

let fetched_time = new Date();
let payload: any[] = [];

async function getBlogEntries(): Promise<BlogEntry[]> {
  const data = await notion.databases.query({
    database_id: blog_database_id,
  });
  const results: BlogEntry[] = data.results.map((entry: any) => toBlogEntry(entry));
  return results;
}

export default defineEventHandler(async () => {
  if (new Date().getTime() - fetched_time.getTime() > 1) {
    payload = await getBlogEntries();
    fetched_time = new Date();
  }
  return {
    status: 200,
    body: payload,
  };
});
