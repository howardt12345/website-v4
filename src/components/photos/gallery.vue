<script setup lang="ts">
import { PhotoItem } from '~/types/photos';

interface Props {
  photos: PhotoItem[];
  selectedTags: string[];
}

const props = defineProps<Props>();
</script>

<template>
  <v-row v-masonry dense>
    <v-col
      v-for="(photo, index) in photos"
      v-masonry-tile
      :key="`${index}-photo-${photo.name}`"
      cols="12"
      sm="12"
      md="6"
      lg="4"
    >
      <PhotosCard :photo="photo" :selected-tags="selectedTags" />
    </v-col>
  </v-row>
</template>

<style scoped lang="scss"></style>
