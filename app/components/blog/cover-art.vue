<script setup lang="ts">
interface Props {
  cover: { hue: number; pattern: string };
  image?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="blog-cover-art" aria-hidden="true">
    <template v-if="image">
      <img :src="image" alt="" class="blog-cover-art__img" />
    </template>
    <CommonPhotoPlaceholder v-else :hue="cover.hue" :pattern="cover.pattern" />
  </div>
</template>

<style scoped lang="scss">
.blog-cover-art {
  position: relative;
  width: 100%;
  overflow: hidden;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
</style>
