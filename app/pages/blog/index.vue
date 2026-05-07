<script setup lang="ts">
import type { BlogPost } from '~/composables/blog';

definePageMeta({ layout: 'default' });

useSeoMeta({
  title: 'Blog · Howard Tseng',
  description: 'Field notes on engineering, hardware and photography. Mostly things I wanted to write down before I forgot them.',
});

const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection('blog').order('date', 'DESC').all(),
);

const allPosts = computed<BlogPost[]>(() => (posts.value ?? []) as unknown as BlogPost[]);

const filterCat = ref('all');
const filterSub = ref<string | null>(null);
const filterTags = ref<string[]>([]);
const filterQuery = ref('');
const filterArchive = ref<string | null>(null);

const activeFilterCount = computed(
  () =>
    (filterCat.value !== 'all' ? 1 : 0) +
    (filterSub.value ? 1 : 0) +
    filterTags.value.length +
    (filterQuery.value ? 1 : 0) +
    (filterArchive.value ? 1 : 0),
);

const filteredPosts = computed(() =>
  allPosts.value.filter((p) => {
    if (filterCat.value !== 'all' && p.category !== filterCat.value) return false;
    if (filterSub.value && p.subcategory !== filterSub.value) return false;
    for (const t of filterTags.value) if (!p.tags.includes(t)) return false;
    if (filterArchive.value && !p.date.startsWith(filterArchive.value)) return false;
    if (filterQuery.value) {
      const q = filterQuery.value.toLowerCase();
      const hay = (p.title + ' ' + p.summary + ' ' + p.tags.join(' ')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }),
);

const pinnedPost = computed(() => allPosts.value.find((p) => p.pinned));

const showFeatured = computed(() => !!pinnedPost.value && activeFilterCount.value === 0);

const displayedPosts = computed(() =>
  showFeatured.value
    ? filteredPosts.value.filter((p) => p.path !== pinnedPost.value!.path)
    : filteredPosts.value,
);

const clearFilters = () => {
  filterCat.value = 'all';
  filterSub.value = null;
  filterTags.value = [];
  filterQuery.value = '';
  filterArchive.value = null;
};
</script>

<template>
  <div class="blog-page content-container">
    <div class="blog-page__header">
      <div>
        <h1 class="blog-page__title">Blog</h1>
        <p class="blog-page__subtitle">
          Field notes on engineering, hardware and photography. Mostly things I wanted to write down before I forgot them.
        </p>
      </div>
    </div>

    <BlogFeaturedCard v-if="showFeatured && pinnedPost" :post="pinnedPost" />

    <div class="blog-filter-bar">
      <div class="blog-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          v-model="filterQuery"
          type="search"
          placeholder="Search posts, tags…"
          aria-label="Search posts"
          class="blog-search__input"
        />
      </div>
      <span class="blog-result-count">{{ filteredPosts.length }} of {{ allPosts.length }} posts</span>
    </div>

    <div class="blog-layout">
      <BlogSidebarFilters
        :posts="allPosts"
        :cat="filterCat"
        :sub="filterSub"
        :tags="filterTags"
        :archive="filterArchive"
        @update:cat="filterCat = $event"
        @update:sub="filterSub = $event"
        @update:tags="filterTags = $event"
        @update:archive="filterArchive = $event"
      />

      <div class="blog-grid">
        <template v-if="displayedPosts.length">
          <BlogPostCard v-for="post in displayedPosts" :key="post.path" :post="post" />
        </template>
        <div v-else class="blog-empty">
          <h3>No posts match those filters</h3>
          <p>Try removing a tag or widening the category.</p>
          <v-btn variant="outlined" size="small" class="blog-empty__reset" @click="clearFilters">
            Clear all filters
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.blog-page {
  padding-top: rem(48);
  padding-bottom: rem(96);

  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: rem(32);
    margin-bottom: rem(24);

    @media (max-width: 960px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__title {
    font-size: clamp(#{rem(44)}, 6vw, #{rem(68)});
    line-height: 1.02;
    letter-spacing: -0.025em;
    font-weight: 300;
    color: $text;
    margin: 0;
  }

  &__subtitle {
    color: $text-secondary;
    margin-top: rem(14);
    font-size: rem(16);
    line-height: 1.6;
  }

  &__meta {
    color: $text-secondary;
    font-size: rem(13);
    white-space: nowrap;
    opacity: 0.6;
  }
}

.blog-filter-bar {
  display: flex;
  align-items: center;
  gap: rem(12);
  margin-bottom: rem(32);
  padding-bottom: rem(28);
  margin-top: rem(28);
  border-bottom: 1px solid $border-color;
  flex-wrap: wrap;
}

.blog-search {
  display: flex;
  align-items: center;
  gap: rem(8);
  padding: rem(8) rem(12);
  background: rgb(var(--v-theme-surface));
  border: 1px solid $border-color;
  border-radius: rem(10);
  flex: 1;
  min-width: rem(240);
  max-width: rem(380);
  color: $text-secondary;
  transition: $transition-fast;

  &:focus-within {
    border-color: $accent;
  }

  &__input {
    flex: 1;
    background: transparent;
    border: 0;
    outline: 0;
    color: $text;
    font: inherit;
    font-size: rem(14);

    &::placeholder {
      color: $text-secondary;
      opacity: 0.6;
    }
  }
}

.blog-result-count {
  margin-left: auto;
  color: $text-secondary;
  font-size: rem(12);
  opacity: 0.6;
}

.blog-layout {
  display: grid;
  grid-template-columns: rem(240) 1fr;
  gap: rem(48);
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: rem(32);
  }
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: rem(28);

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
}

.blog-empty {
  grid-column: 1 / -1;
  padding: rem(80) rem(24);
  text-align: center;
  border: 1px dashed $border-color;
  border-radius: rem(14);
  color: $text-secondary;

  h3 {
    font-size: rem(20);
    margin-bottom: rem(8);
    font-weight: 500;
  }

  p {
    margin: 0;
    opacity: 0.75;
  }

  &__reset {
    margin-top: rem(14);
  }
}
</style>
