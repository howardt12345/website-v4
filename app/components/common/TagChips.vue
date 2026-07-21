<script setup lang="ts">
interface Props {
  tags: string[];
  selectedTags?: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{ toggleTag: [tag: string] }>();
const selected = computed<string[]>(() => props.selectedTags ?? []);
</script>

<template>
  <v-chip-group :model-value="selected" multiple color="primary">
    <v-chip
      v-for="tag in tags"
      :key="tag"
      :value="tag"
      class="chip"
      @click.stop="emit('toggleTag', tag)"
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
