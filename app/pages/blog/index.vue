<script setup lang="ts">
import type { BlogPost } from '~/composables/blog';
import { useDebounceFn } from '@vueuse/core';

definePageMeta({ layout: 'default' });

useSeoMeta({
  title: 'Blog · Howard Tseng',
  description: 'Field notes on engineering, hardware and photography. Mostly things I wanted to write down before I forgot them.',
});

const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection('blog').order('date', 'DESC').all(),
);

const allPosts = computed<BlogPost[]>(() => (posts.value ?? []) as unknown as BlogPost[]);

const route = useRoute();
const router = useRouter();

// Prerendered pages carry no query, so gate the URL reads until after hydration to keep server and client markup identical.
const mounted = ref(false);
const searchText = ref('');
onMounted(() => {
  mounted.value = true;
  searchText.value = (route.query.q as string) ?? '';
});

const filterCat = computed<string>({
  get: () => (mounted.value ? ((route.query.category as string) ?? 'all') : 'all'),
  set: (value) => {
    router.replace({
      query: {
        ...route.query,
        category: value === 'all' ? undefined : value,
        sub: undefined,
        tags: undefined,
      },
    });
  },
});
const filterSub = computed<string | null>({
  get: () => (mounted.value ? ((route.query.sub as string) ?? null) : null),
  set: (value) => {
    router.replace({ query: { ...route.query, sub: value ?? undefined } });
  },
});
const filterTags = computed<string[]>({
  get: () => {
    if (!mounted.value) return [];
    const raw = route.query.tags;
    return typeof raw === 'string' && raw ? raw.split(',') : [];
  },
  set: (value) => {
    router.replace({
      query: { ...route.query, tags: value.length ? value.join(',') : undefined },
    });
  },
});
const commitSearch = useDebounceFn((value: string) => {
  router.replace({ query: { ...route.query, q: value || undefined } });
}, 300);
const filterQuery = computed<string>({
  get: () => searchText.value,
  set: (value) => {
    searchText.value = value;
    commitSearch(value);
  },
});
watch(
  () => route.query.q,
  (value) => {
    searchText.value = (value as string) ?? '';
  },
);
const filterArchive = computed<string | null>({
  get: () => (mounted.value ? ((route.query.archive as string) ?? null) : null),
  set: (value) => {
    router.replace({ query: { ...route.query, archive: value ?? undefined } });
  },
});

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
      const matches =
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matches) return false;
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
  filterQuery.value = '';
  router.replace({
    query: {
      ...route.query,
      category: undefined,
      sub: undefined,
      tags: undefined,
      q: undefined,
      archive: undefined,
    },
  });
};

</script>

<template>
  <div class="blog-page content-container">
    <div class="blog-page__header">
      <div>
        <h1 class="blog-page__title">{{ $t('Blog') }}</h1>
        <p class="blog-page__subtitle">
          {{ $t('Field notes on engineering, hardware and photography. Mostly things I wanted to write down before I forgot them.') }}
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
          :placeholder="$t('Search posts, tags…')"
          :aria-label="$t('Search posts')"
          class="blog-search__input"
        >
      </div>
      <span class="blog-result-count" v-text="$t('{{n}} of {{m}} posts', { n: filteredPosts.length, m: allPosts.length, count: allPosts.length })" />
    </div>

    <div class="blog-layout">
      <v-expansion-panels
        variant="accordion"
        class="blog-filters-disclosure"
      >
        <v-expansion-panel>
          <v-expansion-panel-title>
            {{ activeFilterCount ? $t('Filters') + ' (' + activeFilterCount + ')' : $t('Filters') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
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
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <BlogSidebarFilters
        class="blog-sidebar--desktop"
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
          <h3>{{ $t('No posts match those filters') }}</h3>
          <p>{{ $t('Try removing a tag or widening the category.') }}</p>
          <v-btn variant="outlined" size="small" class="blog-empty__reset" @click="clearFilters">
            {{ $t('Clear all filters') }}
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
    margin-bottom: rem(24);
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

.blog-filters-disclosure {
  display: none;
  border: 1px solid $border-color;
  border-radius: rem(10);
  overflow: hidden;
  background: rgb(var(--v-theme-surface));

  @media (max-width: 960px) {
    display: block;
  }

  :deep(.v-expansion-panel) {
    background: transparent;
  }

  :deep(.v-expansion-panel-title) {
    min-height: rem(48);
    font-size: rem(13);
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  :deep(.v-expansion-panel-title--active) {
    border-bottom: 1px solid $border-color;
  }
}

.blog-sidebar--desktop {
  @media (max-width: 960px) {
    display: none;
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
