<script setup lang="ts">
interface Props {
  links: Array<{ id: string; text: string; depth: number }>;
  activeId: string | null;
}
defineProps<Props>();
defineEmits<{ select: [id: string] }>();
</script>

<template>
  <a
    v-for="link in links"
    :key="link.id"
    :href="`#${link.id}`"
    class="blog-toc__item"
    :class="{
      'blog-toc__item--h3': link.depth === 3,
      'blog-toc__item--active': activeId === link.id,
    }"
    @click.prevent="$emit('select', link.id)"
  >
    {{ link.text }}
  </a>
</template>

<style scoped lang="scss">
.blog-toc__item {
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
  }

  &--h3 {
    padding-left: rem(20);
    font-size: rem(12);
  }

  &--active {
    color: $accent-text;
    border-left-color: $accent;
    opacity: 1;
  }
}
</style>
