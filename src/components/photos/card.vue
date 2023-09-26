<script setup lang="ts">
import { PhotoItem } from '@/types/photos';

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
  <v-card variant="flat" @click="openDialog">
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
  <v-dialog
    v-model="dialogOpen"
    :max-width="(photo.width / photo.height) * 1000"
  >
    <v-card>
      <v-img :src="photo.url" :aspect-ratio="photo.width / photo.height">
      </v-img>
      <v-card-actions>
        <v-btn
          color="primary"
          variant="outlined"
          class="close-button"
          @click="closeDialog"
          >{{ $t('Close') }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.chip-group {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3));
}
.chip {
  text-transform: capitalize;
}
.close-button {
  margin: rem(8);
  margin-left: auto;
}
</style>
