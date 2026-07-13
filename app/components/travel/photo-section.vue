<script setup lang="ts">
import type { TravelPlace } from '~/types/travel';
import type { PhotoItem } from '~/types/photos';
import type { LightboxEntry } from '~/types/ui';

interface Props {
  place: TravelPlace;
  placeIndex: number;
  totalPlaces: number;
  baseHue: number;
  photos: PhotoItem[];
}

const props = defineProps<Props>();
defineEmits<{ 'nav-stop': [index: number] }>();

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

const lightboxPhotos = computed<LightboxEntry[]>(() =>
  props.photos.map((photo) => ({
    src: photo.url,
    alt: photo.alt ?? photo.title ?? props.place.name,
    title: photo.title,
    caption: photo.caption,
    label: props.place.name,
    tags: photo.tags,
  })),
);

function openLightbox(index: number) {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
}
</script>

<template>
  <div class="photo-section">
    <div class="photo-section__head">
      <div>
        <div class="photo-section__eyebrow" v-text="$t('Stop {{n}} of {{m}}', { n: placeIndex + 1, m: totalPlaces })" />
        <div class="photo-section__name">{{ place.name }}</div>
      </div>
      <div class="photo-section__actions">
        <v-btn
          icon
          size="x-small"
          variant="text"
          :disabled="placeIndex === 0"
          :aria-label="$t('Previous stop')"
          @click="$emit('nav-stop', placeIndex - 1)"
        >
          <v-icon size="14">fas fa-chevron-left</v-icon>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          variant="text"
          :disabled="placeIndex === totalPlaces - 1"
          :aria-label="$t('Next stop')"
          @click="$emit('nav-stop', placeIndex + 1)"
        >
          <v-icon size="14">fas fa-chevron-right</v-icon>
        </v-btn>
        <v-btn
          v-if="place.blogSlug"
          :to="`/blog/${place.blogSlug}`"
          variant="text"
          size="small"
          class="photo-section__link"
        >
          {{ $t('Read post') }} →
        </v-btn>
      </div>
    </div>

    <div v-if="photos.length" class="photo-grid">
      <button
        v-for="(photo, i) in photos"
        :key="photo.url"
        type="button"
        class="photo-grid__btn"
        :aria-label="$t('View photo: {{name}}', { name: photo.alt ?? photo.title ?? place.name })"
        @click="openLightbox(i)"
      >
        <v-img
          :src="photo.url"
          :alt="photo.alt ?? photo.title ?? place.name"
          :aspect-ratio="1"
          cover
          class="photo-grid__photo"
        />
      </button>
    </div>
    <p v-else class="photo-section__empty">{{ $t('No photos for this stop yet.') }}</p>

    <CommonPhotoLightbox
      v-model="lightboxOpen"
      :photos="lightboxPhotos"
      :start-index="lightboxIndex"
    />
  </div>
</template>

<style scoped lang="scss">
.photo-section {
  &__head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: rem(14);
  }

  &__eyebrow {
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $text-secondary;
    font-weight: 600;
    opacity: 0.7;
    margin-bottom: rem(4);
  }

  &__name {
    font-size: rem(20);
    font-weight: 500;
    color: $text;
    letter-spacing: -0.01em;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: rem(2);
  }

  &__link {
    color: $accent;
    letter-spacing: normal;
    text-transform: none;
    font-size: rem(13);
  }

  &__empty {
    color: $text-secondary;
    font-size: rem(13);
    opacity: 0.6;
    margin: 0;
    padding: rem(24) 0;
  }
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: rem(10);

  @media (max-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }

  &__btn {
    display: block;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid $accent;
      outline-offset: 2px;
    }
  }

  &__photo {
    border-radius: rem(8);
    transition: opacity 0.2s ease;

    @media (hover: hover) {
      .photo-grid__btn:hover & {
        opacity: 0.88;
      }
    }
  }
}
</style>
