<script setup lang="ts">
import type { BlogPost } from '~/composables/blog';
import { BLOG_CATEGORIES } from '~/composables/blog';

interface Props {
  posts: BlogPost[];
  cat: string;
  sub: string | null;
  tags: string[];
  archive: string | null;
}

interface Emits {
  (e: 'update:cat', value: string): void;
  (e: 'update:sub', value: string | null): void;
  (e: 'update:tags', value: string[]): void;
  (e: 'update:archive', value: string | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const allTags = computed(() => {
  const map = new Map<string, number>();
  props.posts.forEach((p) => p.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
});

const archiveYears = computed(() => {
  const map = new Map<string, number>();
  props.posts.forEach((p) => {
    const yr = p.date.slice(0, 4);
    map.set(yr, (map.get(yr) ?? 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
});

const catCount = (slug: string) =>
  slug === 'all' ? props.posts.length : props.posts.filter((p) => p.category === slug).length;

const subCount = (catSlug: string, subSlug: string) =>
  props.posts.filter((p) => p.category === catSlug && p.subcategory === subSlug).length;

const setCat = (slug: string) => {
  emit('update:cat', slug);
  emit('update:sub', null);
};

const toggleSub = (slug: string) => {
  emit('update:sub', props.sub === slug ? null : slug);
};

const toggleTag = (tag: string) => {
  const next = props.tags.includes(tag)
    ? props.tags.filter((t) => t !== tag)
    : [...props.tags, tag];
  emit('update:tags', next);
};

const toggleArchive = (yr: string) => {
  emit('update:archive', props.archive === yr ? null : yr);
};
</script>

<template>
  <aside class="blog-sidebar">
    <div class="blog-sidebar__group">
      <div class="blog-sidebar__label">Categories</div>

      <v-btn
        variant="text"
        :color="cat === 'all' ? 'primary' : undefined"
        block
        class="blog-sidebar__item"
        @click="setCat('all')"
      >
        <span>All posts</span>
        <span class="blog-sidebar__count">{{ catCount('all') }}</span>
      </v-btn>

      <template v-for="c in BLOG_CATEGORIES" :key="c.slug">
        <v-btn
          variant="text"
          :color="cat === c.slug ? 'primary' : undefined"
          block
          class="blog-sidebar__item"
          @click="setCat(c.slug)"
        >
          <span>{{ c.name }}</span>
          <span class="blog-sidebar__count">{{ catCount(c.slug) }}</span>
        </v-btn>

        <div v-if="cat === c.slug" class="blog-sidebar__sub">
          <v-btn
            v-for="s in c.subcategories"
            :key="s.slug"
            variant="text"
            :color="sub === s.slug ? 'primary' : undefined"
            block
            class="blog-sidebar__item"
            @click="toggleSub(s.slug)"
          >
            <span>{{ s.name }}</span>
            <span class="blog-sidebar__count">{{ subCount(c.slug, s.slug) }}</span>
          </v-btn>
        </div>
      </template>
    </div>

    <div class="blog-sidebar__group">
      <div class="blog-sidebar__label">Tags</div>
      <div class="blog-sidebar__tags">
        <v-chip
          v-for="[tag, count] in allTags"
          :key="tag"
          size="small"
          :variant="tags.includes(tag) ? 'flat' : 'tonal'"
          :color="tags.includes(tag) ? 'primary' : undefined"
          class="blog-sidebar__chip"
          @click="toggleTag(tag)"
        >
          {{ tag }}<span class="blog-sidebar__chip-count">{{ count }}</span>
        </v-chip>
      </div>
    </div>

    <div class="blog-sidebar__group">
      <div class="blog-sidebar__label">Archive</div>
      <div class="blog-sidebar__archive">
        <v-btn
          v-for="[yr, count] in archiveYears"
          :key="yr"
          variant="text"
          :color="archive === yr ? 'primary' : undefined"
          block
          class="blog-sidebar__item"
          @click="toggleArchive(yr)"
        >
          <span>{{ yr }}</span>
          <span class="blog-sidebar__count">{{ count }}</span>
        </v-btn>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.blog-sidebar {
  position: sticky;
  top: calc(#{$nav-height} + #{rem(24)});
  display: flex;
  flex-direction: column;
  gap: rem(28);

  @media (max-width: 960px) {
    position: static;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: rem(2);
  }

  &__label {
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $text-secondary;
    font-weight: 600;
    margin-bottom: rem(6);
    opacity: 0.7;
  }

  &__item {
    font-size: rem(13.5);
    font-family: inherit;
    letter-spacing: normal;
    text-transform: none;

    :deep(.v-btn__content) {
      width: 100%;
      justify-content: space-between;
    }
  }

  &__count {
    font-size: rem(11);
    color: $text-secondary;
    opacity: 0.6;
  }

  &__sub {
    padding-left: rem(16);
    margin: rem(2) 0 rem(8);
    display: flex;
    flex-direction: column;
    gap: rem(2);
    border-left: 1px solid $border-color;
    margin-left: rem(10);
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: rem(6);
  }

  &__chip {
    cursor: pointer;
  }

  &__chip-count {
    margin-left: rem(4);
    font-size: rem(11);
    opacity: 0.5;
  }

  &__archive {
    display: flex;
    flex-direction: column;
    gap: rem(2);
  }
}
</style>
