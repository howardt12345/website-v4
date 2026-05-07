<script setup lang="ts">
import type { BlogPost } from '~/composables/blog';
import { catName, subName, formatPostDate, slugFromPath } from '~/composables/blog';

interface Props {
  post: BlogPost;
}

defineProps<Props>();
</script>

<template>
  <NuxtLink :to="`/blog/${slugFromPath(post.path)}`" class="featured-card">
    <BlogCoverArt
      :cover="post.cover"
      :image="post.image"
      class="featured-card__cover"
    />

    <div class="featured-card__body">
      <div class="featured-card__eyebrow">Featured · {{ catName(post.category) }}</div>

      <h2 class="featured-card__title">{{ post.title }}</h2>

      <div class="featured-card__meta">
        <span>{{ formatPostDate(post.date) }}</span>
        <span>{{ post.readMins }} min read</span>
        <span>{{ subName(post.category, post.subcategory) }}</span>
      </div>

      <p class="featured-card__excerpt">{{ post.summary }}</p>

      <div class="featured-card__tags">
        <v-chip v-for="tag in post.tags" :key="tag" size="small" variant="tonal">{{ tag }}</v-chip>
      </div>

      <span class="featured-card__link">Read article →</span>
    </div>
  </NuxtLink>
</template>

<style scoped lang="scss">
.featured-card {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  background: rgb(var(--v-theme-surface));
  border: 1px solid $border-color;
  border-radius: rem(14);
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04), 0 24px 60px rgba(0, 0, 0, 0.3);
  text-decoration: none;
  color: inherit;
  transition: $transition;

  &:hover {
    border-color: rgb(var(--v-border-opacity));
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 32px 72px rgba(0, 0, 0, 0.38);
    text-decoration: none;
    color: inherit;
  }

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }

  &__cover {
    height: 100%;
    min-height: rem(360);
    border-radius: 0;

    @media (max-width: 960px) {
      min-height: rem(220);
      aspect-ratio: 16 / 9;
    }
  }

  &__body {
    padding: rem(40) rem(44);
    display: flex;
    flex-direction: column;
    gap: rem(18);
    justify-content: center;
  }

  &__eyebrow {
    display: flex;
    align-items: center;
    gap: rem(10);
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $accent;
    font-weight: 600;

    &::before {
      content: '';
      display: inline-block;
      width: rem(22);
      height: 1px;
      background: $accent;
      flex-shrink: 0;
    }
  }

  &__title {
    font-size: clamp(#{rem(28)}, 3vw, #{rem(40)});
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-weight: 500;
    color: $text;
    margin: 0;
  }

  &__meta {
    display: flex;
    gap: rem(14);
    color: $text-secondary;
    font-size: rem(13);
    opacity: 0.75;

    > *:not(:first-child) {
      position: relative;
      padding-left: rem(14);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        width: 4px;
        height: 4px;
        background: $border-color;
        border-radius: 50%;
        transform: translateY(-50%);
      }
    }
  }

  &__excerpt {
    color: $text-secondary;
    font-size: rem(15.5);
    line-height: 1.65;
    max-width: 52ch;
    margin: 0;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: rem(6);
  }

  &__link {
    color: $accent;
    font-size: rem(14);
    font-weight: 500;
    margin-top: rem(4);
  }
}
</style>
