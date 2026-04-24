<script setup lang="ts">
interface Props {
  tags: string[];
  selectedTags?: string[];
}

const props = defineProps<Props>();
const selected = computed<string[]>(() => props.selectedTags ?? []);
</script>

<template>
  <v-chip-group :model-value="selected" variant="flat">
    <v-chip
      v-for="tag in tags"
      :key="tag"
      :value="tag"
      :color="selected.includes(tag) ? 'primary' : 'secondary'"
      label
      class="chip"
    >
      {{ tag }}
    </v-chip>
  </v-chip-group>
</template>

<style scoped lang="scss">
.chip {
  text-transform: capitalize;
}
</style>
