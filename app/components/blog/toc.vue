<script setup lang="ts">
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
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<template>
  <nav v-if="flatLinks.length" class="blog-toc" aria-label="On this page">
    <div class="blog-toc__label">On this page</div>
    <a
      v-for="link in flatLinks"
      :key="link.id"
      :href="`#${link.id}`"
      class="blog-toc__item"
      :class="{
        'blog-toc__item--h3': link.depth === 3,
        'blog-toc__item--active': activeId === link.id,
      }"
      @click.prevent="scrollToHeading(link.id)"
    >
      {{ link.text }}
    </a>
  </nav>
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

  &__item {
    color: $text-secondary;
    padding: rem(4) rem(10);
    border-left: 2px solid $border-color;
    font-size: rem(12.5);
    line-height: 1.4;
    text-decoration: none;
    transition: $transition-fast;
    opacity: 0.75;

    &:hover {
      color: $text;
      opacity: 1;
      text-decoration: none;
    }

    &--h3 {
      padding-left: rem(20);
      font-size: rem(12);
    }

    &--active {
      color: $accent;
      border-left-color: $accent;
      opacity: 1;
    }
  }
}
</style>
