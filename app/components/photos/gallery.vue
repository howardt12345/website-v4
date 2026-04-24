<script setup lang="ts">
import type { PhotoItem } from '~/types/photos';
import type { LightboxEntry } from '~/types/ui';

interface Props {
  photos: PhotoItem[];
  selectedTags: string[];
}

const props = defineProps<Props>();

const lightboxPhotos = computed<LightboxEntry[]>(() =>
  props.photos.map((photo) => ({
    src: photo.url,
    alt: photo.alt ?? photo.title,
    title: photo.title,
    caption: photo.caption,
    tags: photo.tags,
  })),
);

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(index: number) {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
}
</script>

<template>
  <div
    v-masonry
    class="masonry-grid"
    item-selector=".masonry-item"
    column-width=".masonry-sizer"
    percent-position="true"
  >
    <div class="masonry-sizer" />
    <div
      v-for="(photo, index) in photos"
      :key="photo.stem"
      v-masonry-tile
      class="masonry-item"
    >
      <PhotosCard :photo="photo" :selected-tags="selectedTags" @select="openLightbox(index)" />
    </div>
  </div>

  <CommonPhotoLightbox
    v-model="lightboxOpen"
    :photos="lightboxPhotos"
    :start-index="lightboxIndex"
    :selected-tags="selectedTags"
  />
</template>

<style scoped lang="scss">
.masonry-grid {
  width: 100%;
}

.masonry-sizer,
.masonry-item {
  width: 100%;
  padding: 4px;
  box-sizing: border-box;

  @media (min-width: 540px) {
    width: 50%;
  }

  @media (min-width: 800px) {
    width: 33.333%;
  }

  @media (min-width: 1280px) {
    width: 25%;
  }
}
</style>
