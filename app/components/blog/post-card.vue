<script setup lang="ts">
import type { BlogPost } from '~/composables/blog';
import { catName, subName, formatPostDate, slugFromPath } from '~/composables/blog';

interface Props {
  post: BlogPost;
}

defineProps<Props>();
</script>

<template>
  <NuxtLink :to="`/blog/${slugFromPath(post.path)}`" class="post-card">
    <BlogCoverArt
      :cover="post.cover"
      :image="post.image"
      class="post-card__cover"
    />

    <div class="post-card__meta">
      <span class="post-card__cat">{{ catName(post.category) }}</span>
      <span class="post-card__dot" />
      <span>{{ subName(post.category, post.subcategory) }}</span>
      <span class="post-card__dot" />
      <span>{{ formatPostDate(post.date) }}</span>
      <span class="post-card__dot" />
      <span>{{ post.readMins }} min read</span>
    </div>

    <h3 class="post-card__title">{{ post.title }}</h3>
    <p class="post-card__excerpt">{{ post.summary }}</p>

    <div class="post-card__tags">
      <v-chip v-for="tag in post.tags.slice(0, 4)" :key="tag" size="small" variant="tonal">
        {{ tag }}
      </v-chip>
    </div>
  </NuxtLink>
</template>

<style scoped lang="scss">
.post-card {
  display: flex;
  flex-direction: column;
  gap: rem(14);
  padding: rem(18);
  background: rgb(var(--v-theme-surface));
  border-radius: rem(14);
  cursor: pointer;
  transition: $transition;
  color: inherit;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }

  &__cover {
    aspect-ratio: 16 / 9;
    border-radius: rem(10);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: rem(6);
    align-items: center;
    color: $text-secondary;
    font-size: rem(12);
    opacity: 0.75;
  }

  &__cat {
    color: $accent;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: rem(10.5);
  }

  &__dot {
    width: 3px;
    height: 3px;
    background: $border-color;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__title {
    font-size: rem(21);
    line-height: 1.2;
    letter-spacing: -0.01em;
    font-weight: 500;
    color: $text;
    margin: 0;
  }

  &__excerpt {
    color: $text-secondary;
    font-size: rem(14);
    line-height: 1.55;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: rem(6);
    margin-top: auto;
    padding-top: rem(4);
  }
}
</style>
