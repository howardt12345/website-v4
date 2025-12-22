<script setup lang="ts">
interface Props {
  items: string[];
  grid?: boolean
}
const props = defineProps<Props>();
</script>

<template>
  <ul :class="{
    'list-items': true,
    'list-items--grid': grid
  }">
    <li v-for="item in items" :key="item" class="list-items__item">
      <v-icon class="list-items__icon"></v-icon>
      <span class="list-items__text">{{ item }}</span>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.list-items {
  width: 100%;
  margin-bottom: rem(16);
  list-style-position: inside;
  list-style: none;

  &--grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: rem(8);

    @media (max-width: 1080px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 480px) {
      grid-template-columns: none;
    }
  }

  &__item {
    &:before {
      content: '▹';
      color: $accent;
    }
  }
}
</style>
