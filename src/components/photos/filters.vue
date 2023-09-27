<script setup lang="ts">
import { useVModel } from '@vueuse/core';

interface Props {
  availableTags: string[];
  selectedTags: string[];
}
interface Emits {
  (event: 'update:selectedTags', value: string[]): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const selectedTags = useVModel(props, 'selectedTags', emits);

const showTagsFilter = ref<boolean>(false);
const toggleTagsFilter = () => {
  showTagsFilter.value = !showTagsFilter.value;
  if (!showTagsFilter.value) {
    selectedTags.value = [];
  }
};
</script>

<template>
  <div>
    <v-btn
      @click="toggleTagsFilter"
      :text="!showTagsFilter ? $t('Filter by Tags') : $t('Close Filters')"
      :prepend-icon="!showTagsFilter ? 'fas fa-filter' : 'fas fa-times'"
      size="small"
    ></v-btn>
    <CommonFilterChips
      v-if="showTagsFilter"
      :tags="availableTags"
      v-model:selected-tags="selectedTags"
    />
  </div>
</template>

<stype scoped lang="scss"></stype>
