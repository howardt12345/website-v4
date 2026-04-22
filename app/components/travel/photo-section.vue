<script setup lang="ts">
import type { TravelPlace } from '~/composables/travel';

interface Props {
  place: TravelPlace;
  placeIndex: number;
  totalPlaces: number;
  baseHue: number;
}

const props = defineProps<Props>();

const HUE_PLACE_STEP = 30;
const HUE_PHOTO_STEP = 10;

// Deterministic color for each photo placeholder: seeds from the place's country hue,
// offsets by place position and the first character of the place name, then steps per photo.
const photoHue = (photoIndex: number): number =>
  (props.baseHue + props.placeIndex * HUE_PLACE_STEP + props.place.name.charCodeAt(0) + photoIndex * HUE_PHOTO_STEP) % 360;
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

    <div class="photo-grid">
      <CommonPhotoPlaceholder
        v-for="k in place.photos"
        :key="k"
        :hue="photoHue(k - 1)"
        class="photo-grid__photo"
      />
    </div>
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
    border-radius: rem(8);
    overflow: hidden;
  }
}
</style>
