<script setup lang="ts">
import { usePhotosStore } from '@/store/photos.store';

const { photos } = storeToRefs(usePhotosStore());

const route = useRoute();

const category = computed<string>(() => route.params.category.toString() ?? '');
const tags = computed<string[]>(() =>
  Array.isArray(route.query.tags)
    ? (route.query.tags as string[])
    : route.query.tags
    ? [route.query.tags]
    : [],
);

const visiblePhotos = computed(() =>
  photos.value
    .filter(
      (photo) =>
        !category.value ||
        photo.category.toLowerCase() === category.value.toLowerCase(),
    )
    .filter(
      (photo) =>
        !tags.value.length ||
        tags.value.some((tag: string) => photo.tags.includes(tag)),
    ),
);

const breadcrumbItems = computed(() => {
  const items = [
    {
      title: 'Photos',
      to: '/photography',
    },
    {
      title: category.value,
      to: `/photography/${category.value}`,
    },
  ];
  return items;
});
</script>

<template>
  <h1 class="section-title">Photos</h1>
  <v-breadcrumbs
    v-if="category"
    :items="breadcrumbItems"
    icon="fas fa-images"
  ></v-breadcrumbs>
  <v-row v-masonry dense>
    <v-col
      v-for="(photo, index) in visiblePhotos"
      v-masonry-tile
      :key="`photo-${index}`"
      cols="12"
      sm="12"
      md="6"
      lg="4"
    >
      <PhotosCard :photo="photo" />
    </v-col>
  </v-row>
</template>
