<script setup lang="ts">
import { useReducedMotion } from '~/composables/useReducedMotion';

interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}

interface Props {
  links: TocLink[];
}

const props = defineProps<Props>();

const prefersReducedMotion = useReducedMotion();
const activeId = ref<string | null>(null);

const flatLinks = computed(() => {
  const result: Array<{ id: string; text: string; depth: number }> = [];
  for (const link of props.links) {
    result.push({ id: link.id, text: link.text, depth: link.depth });
    if (link.children) {
      for (const child of link.children) {
        result.push({ id: child.id, text: child.text, depth: child.depth });
      }
    }
  }
  return result;
});

let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  observer?.disconnect();
  const els = flatLinks.value
    .map((l) => document.getElementById(l.id))
    .filter(Boolean) as HTMLElement[];
  if (!els.length) return;

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activeId.value = visible[0].target.id;
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
  );
  els.forEach((el) => observer!.observe(el));
};

onMounted(() => {
  activeId.value = flatLinks.value[0]?.id ?? null;
  setupObserver();
});

onUnmounted(() => observer?.disconnect());

const scrollToHeading = (id: string) => {
  if (import.meta.client) history.pushState(null, '', `#${id}`);
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: prefersReducedMotion.value ? 'auto' : 'smooth', block: 'start' });
};
</script>

<template>
  <nav v-if="flatLinks.length" class="blog-toc" :aria-label="$t('On this page')">
    <div class="blog-toc__label">{{ $t('On this page') }}</div>
    <BlogTocList :links="flatLinks" :active-id="activeId" @select="scrollToHeading" />
  </nav>

  <details v-if="flatLinks.length" class="blog-toc-mobile">
    <summary class="blog-toc-mobile__summary">{{ $t('On this page') }}</summary>
    <div class="blog-toc-mobile__list">
      <BlogTocList :links="flatLinks" :active-id="activeId" @select="scrollToHeading" />
    </div>
  </details>
</template>

<style scoped lang="scss">
.blog-toc {
  position: fixed;
  right: calc((100vw - #{rem(720)}) / 2 - #{rem(210)});
  top: calc(#{$nav-height} + #{rem(100)});
  width: rem(200);
  max-height: calc(100vh - #{rem(200)});
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: rem(2);

  @media (max-width: 1200px) {
    display: none;
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

}

.blog-toc-mobile {
  display: none;
  margin-bottom: rem(40);
  border: 1px solid $border-color;
  border-radius: rem(10);

  @media (max-width: 1200px) {
    display: block;
  }

  &__summary {
    cursor: pointer;
    padding: rem(12) rem(16);
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $text-secondary;
    font-weight: 600;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: rem(2);
    padding: rem(4) rem(12) rem(12);
  }
}
</style>
