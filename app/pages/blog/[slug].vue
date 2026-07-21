<script setup lang="ts">
import { catName, subName, formatPostDate, relatedPosts as getRelatedPosts } from '~/composables/blog';
import { usei18n } from '~/store/i18n.store';

definePageMeta({ layout: 'default' });

const route = useRoute();
const slug = route.params.slug as string;

const { data: postData } = await useAsyncData(`blog-${slug}`, () =>
  queryCollection('blog').where('path', '=', `/blog/${slug}`).first(),
);

const { data: allPostsData } = await useAsyncData('blog-posts', () =>
  queryCollection('blog').order('date', 'DESC').all(),
);

if (!postData.value) throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });

const { currentLanguage } = storeToRefs(usei18n());

const post = computed(() => postData.value!);
const allPosts = computed(() => allPostsData.value ?? []);

const relatedPosts = computed(() => getRelatedPosts(post.value, allPosts.value));

const tocLinks = computed(() => postData.value?.body.toc?.links ?? []);

const siteUrl = useRuntimeConfig().public.siteUrl as string;
const ogImage = computed(() => {
  const img = post.value.image;
  if (img) return img.startsWith('http') ? img : siteUrl ? `${siteUrl}${img}` : undefined;
  return siteUrl ? `${siteUrl}/images/og-default.jpg` : undefined;
});

useSeoMeta({
  title: computed(() => `${post.value.title} · Howard Tseng`),
  description: computed(() => post.value.summary),
  ogTitle: computed(() => post.value.title),
  ogDescription: computed(() => post.value.summary),
  ogType: 'article',
  ogImage,
});
</script>

<template>
  <div>
    <BlogReadingProgress />
    <BlogToc :links="tocLinks" />

    <article class="blog-article">
      <v-btn
        to="/blog"
        variant="text"
        size="small"
        prepend-icon="fas fa-chevron-left"
        class="blog-article__back"
      >
        {{ $t('All posts') }}
      </v-btn>

      <div class="blog-article__eyebrow">
        <span class="blog-article__eyebrow-line" />
        {{ catName(post.category) }} · {{ subName(post.category, post.subcategory) }}
      </div>

      <h1 class="blog-article__title">{{ post.title }}</h1>
      <p class="blog-article__excerpt">{{ post.summary }}</p>

      <div class="blog-article__meta">
        <span>{{ formatPostDate(post.date, currentLanguage) }}</span>
        <span>·</span>
        <span v-text="$t('{{n}} min read', { n: post.readMins })" />
        <template v-if="post.author">
          <span>·</span>
          <span>{{ post.author }}</span>
        </template>
      </div>

      <BlogCoverArt
        :cover="post.cover"
        :image="post.image"
        class="blog-article__cover"
      />

      <ContentRenderer class="blog-article__body" :value="post" />

      <div class="blog-article__tags">
        <v-chip v-for="tag in post.tags" :key="tag" size="small" variant="tonal">{{ tag }}</v-chip>
      </div>
    </article>

    <section v-if="relatedPosts.length" class="blog-related content-container">
      <div class="blog-related__label">{{ $t('Related reading') }}</div>
      <div class="blog-related__grid">
        <BlogPostCard v-for="p in relatedPosts" :key="p.path" :post="p" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.blog-article {
  max-width: rem(720);
  margin: 0 auto;
  padding: rem(48) rem(28) rem(120);

  &__back {
    color: $text-secondary;
    margin-bottom: rem(36);
    font-size: rem(13);
    letter-spacing: normal;
    text-transform: none;
    transition: $transition-fast;

    &:hover {
      color: $text;
    }
  }

  &__eyebrow {
    display: flex;
    align-items: center;
    gap: rem(10);
    color: $accent;
    font-size: rem(11);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-bottom: rem(16);
  }

  &__eyebrow-line {
    display: inline-block;
    width: rem(22);
    height: 1px;
    background: $accent;
    flex-shrink: 0;
  }

  &__title {
    font-size: clamp(#{rem(32)}, 4.2vw, #{rem(52)});
    line-height: 1.08;
    letter-spacing: -0.025em;
    margin-bottom: rem(16);
    font-weight: 500;
    color: $text;
  }

  &__excerpt {
    font-size: rem(20);
    line-height: 1.5;
    color: $text-secondary;
    font-style: italic;
    margin-bottom: rem(28);
  }

  &__meta {
    display: flex;
    gap: rem(14);
    align-items: center;
    color: $text-secondary;
    font-size: rem(13);
    padding-bottom: rem(24);
    border-bottom: 1px solid $border-color;
    margin-bottom: rem(36);
    opacity: 0.75;
  }

  &__cover {
    aspect-ratio: 21 / 9;
    margin-bottom: rem(40);
    border-radius: rem(14);
  }

  &__body {
    :deep(h2) {
      font-size: rem(28);
      line-height: 1.2;
      margin-top: rem(48);
      margin-bottom: rem(14);
      font-weight: 500;
      color: $text;
      letter-spacing: -0.01em;
      scroll-margin-top: rem(80);
    }

    :deep(h3) {
      font-size: rem(20);
      line-height: 1.3;
      margin-top: rem(32);
      margin-bottom: rem(10);
      font-weight: 500;
      color: $text;
      scroll-margin-top: rem(80);
    }

    :deep(p) {
      font-size: rem(17);
      line-height: 1.75;
      color: $text;
      margin-bottom: rem(20);
    }

    :deep(ul),
    :deep(ol) {
      padding-left: rem(22);
      margin-bottom: rem(20);

      li {
        margin-bottom: rem(6);
        font-size: rem(17);
        line-height: 1.7;
        color: $text;
      }
    }

    :deep(code) {
      font-size: rem(14);
      background: rgb(var(--v-theme-surface));
      border: 1px solid $border-color;
      border-radius: rem(4);
      padding: rem(2) rem(6);
    }

    :deep(pre) {
      background: rgb(var(--v-theme-surface));
      border: 1px solid $border-color;
      border-radius: rem(10);
      padding: rem(20);
      overflow-x: auto;
      margin-bottom: rem(20);

      code {
        background: transparent;
        border: 0;
        padding: 0;
        font-size: rem(14);
        line-height: 1.6;
      }
    }

    :deep(a) {
      color: $accent;
      text-decoration: underline;
      text-underline-offset: 3px;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: rem(6);
    margin-top: rem(40);
    padding-top: rem(24);
    border-top: 1px solid $border-color;
  }
}

.blog-related {
  padding-top: rem(60);
  padding-bottom: rem(100);
  border-top: 1px solid $border-color;

  &__label {
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $text-secondary;
    font-weight: 600;
    margin-bottom: rem(20);
    opacity: 0.7;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: rem(20);

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
