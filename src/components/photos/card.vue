<script setup lang="ts">
import { PhotoItem } from '@/types/photos';

interface Props {
  photo: PhotoItem;
}

const props = defineProps<Props>();
</script>

<template>
  <v-card variant="flat">
    <v-img :src="photo.url" cover :aspect-ratio="photo.width / photo.height" />
  </v-card>
</template>

<style scoped lang="scss"></style>
