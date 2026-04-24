<script setup lang="ts">
import type { PhotoItem } from '~/types/photos';

interface Props {
  photo: PhotoItem;
  selectedTags?: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
const selected = computed<string[]>(() => props.selectedTags ?? []);
</script>

<template>
  <v-card variant="flat" class="photo-card" @click="emit('select')">
    <v-img
      :src="photo.url"
      cover
      :aspect-ratio="photo.aspectRatio"
      class="align-end"
    >
      <v-card-actions v-if="selected.length" class="chip-group">
        <UiTagChips :tags="photo.tags" :selected-tags="selected" />
      </v-card-actions>
    </v-img>
  </v-card>
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
</style>
