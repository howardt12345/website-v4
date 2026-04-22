<script setup lang="ts">
import type { PhotoItem } from '~/types/photos';

interface Props {
  photo: PhotoItem;
  selectedTags?: string[];
}

const props = defineProps<Props>();

const selected = computed<string[]>(() => props.selectedTags ?? []);
const dialogOpen = ref(false);
const openDialog = () => (dialogOpen.value = true);
const closeDialog = () => (dialogOpen.value = false);
</script>

<template>
  <v-card variant="flat" class="photo-card" @click="openDialog">
    <v-img
      :src="photo.url"
      cover
      :aspect-ratio="photo.aspectRatio"
      class="align-end"
    >
      <v-card-actions v-if="selected.length" class="chip-group">
        <PhotosTagChips :tags="photo.tags" :selected-tags="selected" />
      </v-card-actions>
    </v-img>
  </v-card>

  <v-dialog
    v-model="dialogOpen"
    :max-width="photo.aspectRatio * 1000"
  >
    <v-card>
      <v-img :src="photo.url" :aspect-ratio="photo.aspectRatio" />
      <v-card-actions class="dialog-actions">
        <PhotosTagChips :tags="photo.tags" :selected-tags="selected" />
        <v-spacer />
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          @click="closeDialog"
          >{{ $t('Close') }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.photo-card {
  cursor: pointer;
  overflow: hidden;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
}

.chip-group {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
  padding: rem(8);
}

.dialog-actions {
  padding: rem(8) rem(12);
  flex-wrap: wrap;
  gap: rem(8);
}
</style>
