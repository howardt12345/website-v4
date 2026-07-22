<script setup lang="ts">
import type { PhotoItem } from '~/types/photos';
import { usei18n } from '~/store/i18n.store';

interface Props {
  photo: PhotoItem;
  selectedTags?: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{ select: []; toggleTag: [tag: string] }>();
const { t } = usei18n();
const selected = computed<string[]>(() => props.selectedTags ?? []);

const altText = computed<string>(() => {
  const { alt, title, category, date } = props.photo;
  if (alt) return alt;
  if (title) return title;
  if (category) {
    return date
      ? t('{{category}} photo from {{date}}', { category, date })
      : t('{{category}} photo', { category });
  }
  return t('Photo');
});
</script>

<template>
  <v-card
    variant="flat"
    class="photo-card d-flex flex-column"
    :style="{ aspectRatio: photo.aspectRatio }"
  >
    <template #image>
      <v-img :src="photo.url" :alt="altText" cover />
    </template>
    <button
      type="button"
      class="photo-card__open"
      :aria-label="$t('View photo: {{name}}', { name: altText })"
      @click="emit('select')"
    />
    <v-spacer />
    <v-card-actions v-if="photo.tags.length" class="chip-group">
      <CommonTagChips :tags="photo.tags" :selected-tags="selected" @toggle-tag="emit('toggleTag', $event)"/>
    </v-card-actions>
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

.photo-card__open {
  position: absolute;
  inset: 0;
  z-index: 1;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.chip-group {
  position: relative;
  z-index: 2;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.65));
  padding: rem(8) rem(8) rem(6);
}
</style>
