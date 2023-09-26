<script setup lang="ts">
import { PhotoItem } from '@/types/photos';

interface Props {
  photo: PhotoItem;
  selectedTags?: string[];
}

const props = defineProps<Props>();

const selected = computed<string[]>(() => props.selectedTags ?? []);
</script>

<template>
  <v-card variant="flat">
    <v-img
      :src="photo.url"
      cover
      :aspect-ratio="photo.width / photo.height"
      class="align-end"
    >
      <v-card-actions v-if="selected.length" class="chip-group">
        <v-chip-group v-model="selected" color="primary" variant="flat">
          <v-chip
            v-for="tag in photo.tags"
            :key="tag"
            :value="tag"
            label
            :theme="selected.includes(tag) ? 'primary' : 'dark'"
            class="chip"
          >
            {{ tag }}
          </v-chip>
        </v-chip-group>
      </v-card-actions>
    </v-img>
  </v-card>
</template>

<style scoped lang="scss">
.chip-group {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3));
}
.chip {
  text-transform: capitalize;
}
</style>
