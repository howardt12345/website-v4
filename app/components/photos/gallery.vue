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
  <v-row v-masonry dense>
    <v-col
      v-for="(photo, index) in photos"
      :key="photo.stem"
      v-masonry-tile
      cols="12"
      sm="12"
      md="6"
      lg="4"
      xl="3"
      xxl="2"
    >
      <PhotosCard :photo="photo" :selected-tags="selectedTags" @select="openLightbox(index)" />
    </v-col>
  </v-row>

  <UiPhotoLightbox
    v-model="lightboxOpen"
    :photos="lightboxPhotos"
    :start-index="lightboxIndex"
    :selected-tags="selectedTags"
  />
</template>

<style scoped lang="scss"></style>
