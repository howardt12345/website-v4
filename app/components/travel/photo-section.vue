<script setup lang="ts">
import type { TravelPlace, TravelPhoto } from '~/composables/travel';

interface Props {
  place: TravelPlace;
  placeIndex: number;
  totalPlaces: number;
  baseHue: number;
  photos: TravelPhoto[];
}

defineProps<Props>();
</script>

<template>
  <div class="photo-section">
    <div class="photo-section__head">
      <div>
        <div class="photo-section__eyebrow">{{ $t('Stop') }} {{ placeIndex + 1 }} · {{ totalPlaces }}</div>
        <div class="photo-section__name">{{ place.name }}</div>
      </div>
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

    <div v-if="photos.length" class="photo-grid">
      <img
        v-for="photo in photos"
        :key="photo.url"
        :src="photo.url"
        :alt="photo.alt ?? photo.title ?? place.name"
        width="1"
        height="1"
        loading="lazy"
        class="photo-grid__photo"
      />
    </div>
    <p v-else class="photo-section__empty">{{ $t('No photos for this stop yet.') }}</p>
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

  &__photo {
    aspect-ratio: 1;
    width: 100%;
    object-fit: cover;
    border-radius: rem(8);
    display: block;
  }
}
</style>
