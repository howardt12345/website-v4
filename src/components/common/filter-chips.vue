<script setup lang="ts">
import { useVModel } from '@vueuse/core';

interface Props {
  tags: string[];
  selectedTags: string[];
}
interface Emits {
  (event: 'update:selectedTags', value: string[]): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const selectedTags = useVModel(props, 'selectedTags', emits);
</script>

<template>
  <v-chip-group v-model="selectedTags" filter multiple color="primary">
    <v-chip
      v-for="tag in tags"
      :key="tag"
      :value="tag"
      filter
      class="filter-chip"
      >{{ tag }}</v-chip
    >
  </v-chip-group>
</template>

<style scoped lang="scss">
.filter-chip {
  text-transform: capitalize;
}
</style>
