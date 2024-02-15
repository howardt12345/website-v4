export const useBlogStore = defineStore('blog', () => {
  const blogEntries = ref<BlogEntry[]>([]);
  const getBlogEntries = async () => {
    const res = await fetch('/api/notion/blog');
    const data = await res.json();
    blogEntries.value = data.body;
  };
  return {
    blogEntries,
    getBlogEntries,
  };
});