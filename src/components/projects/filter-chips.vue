<script setup lang="ts">
import { useVModel } from '@vueuse/core';

interface Props {
  tags: string[];
  selectedIndexes: number[];
}
const props = defineProps<Props>();
const emits = defineEmits<{
  (event: 'update:selectedIndexes', value: string[]): void;
}>();

const selectedIndexes = useVModel(props, 'selectedIndexes', emits);
</script>

<template>
  <v-chip-group v-model="selectedIndexes" filter multiple color="primary">
    <v-chip v-for="tag in tags" filter>{{ tag }}</v-chip>
  </v-chip-group>
</template>

<style scoped lang="scss"></style>
