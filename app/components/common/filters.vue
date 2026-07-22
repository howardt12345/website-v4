<script setup lang="ts">
import { useVModel } from '@vueuse/core';

interface Props {
  availableTags: string[];
  selectedTags: string[];
  buttonText?: string;
}
interface Emits {
  (event: 'update:selectedTags', value: string[]): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const selectedTags = useVModel(props, 'selectedTags', emits);

const showTagsFilter = ref((props.selectedTags?.length ?? 0) > 0);
watch(
  () => props.selectedTags?.length ?? 0,
  (count, previous) => {
    if (count > 0 && !previous) showTagsFilter.value = true;
  },
);

const toggleTagsFilter = () => (showTagsFilter.value = !showTagsFilter.value);
const clearTags = () => (selectedTags.value = []);
</script>

<template>
  <div class="filters">
    <div class="filters__actions">
      <v-btn
        class="filters__button"
        :text="
          showTagsFilter
            ? $t('Close Filters')
            : (buttonText ?? $t('Filter by Tags')) +
              (selectedTags.length ? ` (${selectedTags.length})` : '')
        "
        :prepend-icon="showTagsFilter ? 'fas fa-times' : 'fas fa-filter'"
        size="small"
        @click="toggleTagsFilter"
      />
      <v-btn
        v-if="selectedTags.length"
        class="filters__clear"
        :text="$t('Clear')"
        prepend-icon="fas fa-xmark"
        size="small"
        @click="clearTags"
      />
    </div>
    <CommonFilterChips
      v-if="showTagsFilter"
      v-model:selected-tags="selectedTags"
      :tags="availableTags"
    />
  </div>
</template>

<style scoped lang="scss">
.filters {
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: rem(8);
  }

  &__button {
    margin-bottom: rem(4);
  }
}
</style>
