<script setup lang="ts">
import type { LightboxEntry } from '~/types/ui';

interface Props {
  modelValue: boolean;
  photos: LightboxEntry[];
  startIndex?: number;
  selectedTags?: string[];
}

const props = withDefaults(defineProps<Props>(), { startIndex: 0 });
const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>();

const currentIndex = ref(props.startIndex);

watch(
  () => [props.modelValue, props.startIndex] as const,
  ([open, idx]) => { if (open) currentIndex.value = idx; },
);

const current = computed(() => props.photos[currentIndex.value]);
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < props.photos.length - 1);

const prev = () => { if (hasPrev.value) currentIndex.value--; };
const next = () => { if (hasNext.value) currentIndex.value++; };
const close = () => emit('update:modelValue', false);

const onKeydown = (e: KeyboardEvent) => {
  if (!props.modelValue) return;
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="current" class="lightbox">
      <v-btn
        icon
        variant="text"
        size="small"
        class="lightbox__close"
        @click="close"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <v-img
        :src="current.src"
        :alt="current.alt"
        max-height="70vh"
        contain
        class="lightbox__img"
      />

      <div class="lightbox__footer">
        <div class="lightbox__meta">
          <p v-if="current.label" class="lightbox__label">{{ current.label }}</p>
          <p v-if="current.title" class="lightbox__title">{{ current.title }}</p>
          <p v-if="current.caption" class="lightbox__caption">{{ current.caption }}</p>
          <slot name="meta" :entry="current" />
          <CommonTagChips
            v-if="current.tags?.length"
            :tags="current.tags"
            :selected-tags="selectedTags"
            class="lightbox__tags"
          />
        </div>

        <div v-if="photos.length > 1" class="lightbox__nav">
          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="!hasPrev"
            @click="prev"
          >
            <v-icon>fas fa-chevron-left</v-icon>
          </v-btn>
          <span class="lightbox__counter">{{ currentIndex + 1 }} / {{ photos.length }}</span>
          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="!hasNext"
            @click="next"
          >
            <v-icon>fas fa-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.lightbox {
  position: relative;
  overflow: hidden;

  &__close {
    position: absolute;
    top: rem(8);
    right: rem(8);
    z-index: 1;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: rem(12) rem(16);
    gap: rem(16);
    min-height: rem(56);
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: rem(2);
    min-width: 0;
  }

  &__label {
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: $text-secondary;
    font-weight: 600;
    opacity: 0.65;
    margin: 0;
  }

  &__title {
    font-size: rem(14);
    font-weight: 500;
    color: $text;
    margin: 0;
    line-height: 1.4;
  }

  &__caption {
    font-size: rem(12);
    color: $text-secondary;
    margin: 0;
    line-height: 1.5;
  }

  &__tags {
    margin-top: rem(6);
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: rem(4);
    flex-shrink: 0;
  }

  &__counter {
    font-size: rem(12);
    color: $text-secondary;
    opacity: 0.7;
    white-space: nowrap;
    min-width: rem(44);
    text-align: center;
  }
}
</style>
