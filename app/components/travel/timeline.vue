<script setup lang="ts">
import type { TravelTimelineEntry } from '~/types/travel';
import type { LightboxEntry } from '~/types/ui';

const props = defineProps<{
  entries: TravelTimelineEntry[];
  emptyText?: string;
}>();

const allLightboxPhotos = computed<LightboxEntry[]>(() =>
  props.entries.flatMap((entry) =>
    entry.photos.map((photo) => ({
      src: photo.url,
      alt: photo.alt,
      label: photo.label,
      title: photo.title,
      caption: photo.caption,
      tags: photo.tags,
    })),
  ),
);

const entryOffsets = computed<number[]>(() => {
  let offset = 0;
  return props.entries.map((entry) => {
    const start = offset;
    offset += entry.photos.length;
    return start;
  });
});

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(entryIdx: number, photoIdx: number) {
  lightboxIndex.value = (entryOffsets.value[entryIdx] ?? 0) + photoIdx;
  lightboxOpen.value = true;
}
</script>

<template>
  <v-timeline
    v-if="entries.length"
    side="end"
    align="start"
    density="compact"
    truncate-line="both"
    class="travel-timeline"
  >
    <v-timeline-item
      v-for="(entry, entryIdx) in entries"
      :key="entry.key"
      size="x-small"
      class="timeline-entry"
    >
      <div class="timeline-entry__body">
        <div v-if="entry.dividerBefore" class="timeline-entry__divider">
          <span class="timeline-entry__divider-label">{{ entry.dividerBefore }}</span>
        </div>

        <component
          :is="entry.onClick ? 'button' : 'div'"
          :class="['timeline-entry__head', { 'timeline-entry__head--clickable': !!entry.onClick }]"
          :type="entry.onClick ? 'button' : undefined"
          @click="entry.onClick?.()"
        >
          <span class="timeline-entry__labels">
            <span v-if="entry.eyebrow" class="timeline-entry__eyebrow">{{ entry.eyebrow }}</span>
            <span class="timeline-entry__title">
              {{ entry.title }}<span v-if="entry.titleSub" class="timeline-entry__title-sub"> · {{ entry.titleSub }}</span>
            </span>
          </span>
          <span v-if="entry.photos.length" class="timeline-entry__count">
            {{ entry.photos.length }} {{ $t('photos') }}
          </span>
        </component>

        <ul v-if="!entry.photos.length && entry.noPhotoPlaces?.length" class="timeline-entry__places">
          <li
            v-for="place in entry.noPhotoPlaces"
            :key="place"
            class="timeline-entry__place"
          >
            {{ place }}
          </li>
        </ul>

        <div v-if="entry.photos.length" class="timeline-entry__photos">
          <figure
            v-for="(photo, photoIdx) in entry.photos"
            :key="photo.url"
            class="timeline-photo"
            @click="openLightbox(entryIdx, photoIdx)"
          >
            <v-img
              :src="photo.url"
              :alt="photo.alt"
              :aspect-ratio="1"
              cover
              class="timeline-photo__img"
            />
            <figcaption v-if="photo.label" class="timeline-photo__caption">{{ photo.label }}</figcaption>
          </figure>
        </div>

        <div v-if="entry.alsoVisited?.length" class="timeline-entry__also">
          <span class="timeline-entry__also-label">{{ $t('Also visited') }}</span>
          <ul class="timeline-entry__places">
            <li
              v-for="place in entry.alsoVisited"
              :key="place"
              class="timeline-entry__place"
            >
              {{ place }}
            </li>
          </ul>
        </div>
      </div>
    </v-timeline-item>
  </v-timeline>

  <p v-else-if="emptyText" class="travel-timeline__empty">{{ emptyText }}</p>

  <CommonPhotoLightbox
    v-model="lightboxOpen"
    :photos="allLightboxPhotos"
    :start-index="lightboxIndex"
  />
</template>

<style scoped lang="scss">
.travel-timeline {
  height: auto;

  :deep(.v-timeline-item__body) {
    justify-self: stretch;
    padding-bottom: 0;
  }

  &__empty {
    color: $text-secondary;
    opacity: 0.6;
    text-align: center;
    padding: rem(40) 0;
    margin: 0;
    font-size: rem(14);
  }
}

.timeline-entry__body {
  padding-bottom: rem(20);

  .timeline-entry:last-child & {
    padding-bottom: 0;
  }
}

.timeline-entry__head {
  display: flex;
  align-items: baseline;
  gap: rem(14);
  width: 100%;
  margin-bottom: rem(16);
  color: inherit;
  text-align: left;

  &--clickable {
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    transition: $transition-fast;

    &:hover .timeline-entry__title {
      color: $accent;
    }
  }
}

.timeline-entry__labels {
  display: flex;
  flex-direction: column;
  gap: rem(2);
}

.timeline-entry__eyebrow {
  font-size: rem(11);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: $text-secondary;
  font-weight: 600;
  opacity: 0.7;
}

.timeline-entry__title {
  font-size: rem(18);
  font-weight: 500;
  color: $text;
  line-height: 1.25;
  transition: $transition-fast;
}

.timeline-entry__title-sub {
  font-size: rem(14);
  font-weight: 400;
  color: $text-secondary;
  letter-spacing: 0;
}

.timeline-entry__count {
  margin-left: auto;
  font-size: rem(11);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: $text-secondary;
  opacity: 0.6;
  white-space: nowrap;
}

.timeline-entry__also {
  margin-top: rem(12);
  display: flex;
  align-items: baseline;
  gap: rem(10);
  flex-wrap: wrap;
}

.timeline-entry__also-label {
  font-size: rem(10);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: $text-secondary;
  opacity: 0.5;
  white-space: nowrap;
  flex-shrink: 0;
}

.timeline-entry__places {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: rem(6);
}

.timeline-entry__place {
  font-size: rem(11);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: $text-secondary;
  opacity: 0.65;
  padding: rem(4) rem(10);
  border: 1px solid $border-color;
  border-radius: rem(20);
  white-space: nowrap;
}

.timeline-entry__photos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: rem(10);

  @media (max-width: 960px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.timeline-photo {
  margin: 0;

  &__img {
    border-radius: rem(8);
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.88;
    }
  }

  &__caption {
    font-size: rem(10);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $text-secondary;
    opacity: 0.65;
    margin-top: rem(5);
  }
}

.timeline-entry__divider {
  display: flex;
  align-items: center;
  gap: rem(10);
  margin-bottom: rem(14);

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: $border-color;
  }
}

.timeline-entry__divider-label {
  font-size: rem(11);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: $text-secondary;
  opacity: 0.65;
  white-space: nowrap;
}
</style>
