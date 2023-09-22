<script setup lang="ts">
import { usePhotosStore } from '@/store/photos.store';

const { photos } = storeToRefs(usePhotosStore());

</script>

<template>
  <h1 class="section-title">Photos</h1>
  <v-container>
    <v-row v-masonry no-gutters>
      <v-col
        v-for="(photo, index) in photos"
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
  </v-container>
</template>

<style scoped lang="scss"></style>
