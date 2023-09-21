<script setup lang="ts">
import { useVModel } from '@vueuse/core';

interface Props {
  tags: string[];
  selectedTags: string[];
}
const props = defineProps<Props>();
const emits = defineEmits<{
  (event: 'update:selectedTags', value: string[]): void;
}>();

const selectedTags = useVModel(props, 'selectedTags', emits);
const selectedIndexes = ref<number[]>([]);

onMounted(() => {
  selectedIndexes.value = props.selectedTags.map((tag) =>
    props.tags.indexOf(tag),
  );
});

watch(selectedIndexes, (newValue) => {
  selectedTags.value = newValue.map((index) => props.tags[index]);
});
</script>

<template>
  <v-chip-group v-model="selectedIndexes" filter multiple color="primary">
    <v-chip v-for="tag in tags" filter>{{ tag }}</v-chip>
  </v-chip-group>
</template>

<style scoped lang="scss"></style>
