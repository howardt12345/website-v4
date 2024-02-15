export const toBlogEntry = (entry: any) => {
  return {
    id: entry.id,
    created_time: entry.created_time,
    last_edited_time: entry.last_edited_time,
    category: entry.properties.Category.multi_select?.map(
      (tag: any) => tag.name,
    ),
    title: entry.properties.Name.title[0].plain_text,
    thumbnail: entry.properties?.thumbnail?.files[0]?.file.url,
    tags: entry.properties.Tags.multi_select?.map((tag: any) => tag.name),
  };
};

export const blogPageToMarkdown = (page: BlogPage) => {
  return {
    info: page.info,
    content: page.content,
  };
};
