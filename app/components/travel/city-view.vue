<script setup lang="ts">
import type { TravelCity, CityViewPlace } from '~/types/travel';
import type { LightboxEntry } from '~/types/ui';
import { formatDayShort } from '~/composables/travel';
import { usei18n } from '~/store/i18n.store';

defineProps<{
  city: TravelCity;
  places: CityViewPlace[];
}>();

const { currentLanguage } = storeToRefs(usei18n());

const lightboxOpen = ref(false);
const lightboxPhotos = ref<LightboxEntry[]>([]);
const lightboxIndex = ref(0);

function openLightbox(place: CityViewPlace, photoIdx: number) {
  lightboxPhotos.value = place.photos.map((photo) => ({
    src: photo.url,
    alt: photo.alt ?? photo.title ?? place.place.name,
    title: photo.title,
    caption: photo.caption,
    label: place.place.name,
  }));
  lightboxIndex.value = photoIdx;
  lightboxOpen.value = true;
}
</script>

<template>
  <div class="city-view">
    <div class="city-view__head">
      <div class="city-view__eyebrow">{{ $t('City') }}</div>
      <h2 class="city-view__title">{{ city.name }}</h2>
    </div>

    <div v-if="places.length" class="city-view__timeline">
      <section
        v-for="(item, i) in places"
        :key="`${item.dayDate}-${item.place.id ?? i}`"
        class="city-place"
      >
        <div class="city-place__head">
          <div class="city-place__eyebrow">
            {{ item.tripTitle }} · {{ formatDayShort(item.dayDate, currentLanguage) }}
          </div>
          <div class="city-place__name">{{ item.place.name }}</div>
        </div>

        <div v-if="item.photos.length" class="city-place__photos">
          <v-img
            v-for="(photo, photoIdx) in item.photos"
            :key="photo.url"
            :src="photo.url"
            :alt="photo.alt ?? photo.title ?? item.place.name"
            :aspect-ratio="1"
            cover
            class="city-place__photo"
            @click="openLightbox(item, photoIdx)"
          />
        </div>
      </section>
    </div>

    <p v-else class="city-view__empty">
      {{ $t('No places recorded for this city yet.') }}
    </p>

    <UiPhotoLightbox
      v-model="lightboxOpen"
      :photos="lightboxPhotos"
      :start-index="lightboxIndex"
    />
  </div>
</template>

<style scoped lang="scss">
.city-view {
  margin-top: rem(8);

  &__head {
    margin-bottom: rem(28);
  }

  &__eyebrow {
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $text-secondary;
    font-weight: 600;
    margin-bottom: rem(6);
    opacity: 0.7;
  }

  &__title {
    font-size: rem(28);
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-weight: 500;
    color: $text;
    margin: 0;
  }

  &__timeline {
    position: relative;
    padding-left: rem(28);

    &::before {
      content: '';
      position: absolute;
      left: rem(7);
      top: rem(8);
      bottom: rem(8);
      width: 1px;
      background: $border-color;
    }
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

.city-place {
  position: relative;
  margin-bottom: rem(44);

  &:last-child {
    margin-bottom: 0;
  }

  &__head {
    display: flex;
    flex-direction: column;
    gap: rem(2);
    margin-bottom: rem(14);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: rem(-28);
      top: rem(6);
      width: rem(11);
      height: rem(11);
      border-radius: 50%;
      background: rgb(var(--v-theme-background));
      border: 2px solid $accent;
    }
  }

  &__eyebrow {
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $text-secondary;
    font-weight: 600;
    opacity: 0.7;
  }

  &__name {
    font-size: rem(18);
    font-weight: 500;
    color: $text;
    line-height: 1.25;
  }

  &__photos {
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

  &__photo {
    border-radius: rem(8);
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.88;
    }
  }
}
</style>
