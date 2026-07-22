<script setup lang="ts">
import type { TravelCity, CityViewPlace, TravelTimelineEntry } from '~/types/travel';
import { formatDayLabel } from '~/composables/travel';
import { usei18n } from '~/store/i18n.store';

const props = defineProps<{
  city: TravelCity;
  countryName?: string;
  places: CityViewPlace[];
}>();

const { currentLanguage } = storeToRefs(usei18n());

const timelineEntries = computed<TravelTimelineEntry[]>(() => {
  let lastDate: string | null = null;
  return props.places.map((item) => {
    const isNewDate = item.dayDate !== lastDate;
    lastDate = item.dayDate;
    return {
      key: `${item.dayDate}-${item.place.id ?? item.place.name}`,
      eyebrow: item.tripTitle,
      title: item.place.name,
      dividerBefore: isNewDate ? formatDayLabel(item.dayDate, currentLanguage.value) : undefined,
      photos: item.photos.map((p) => ({
        url: p.url,
        large: p.largeUrl,
        alt: p.alt ?? p.title ?? item.place.name,
        label: item.place.name,
        title: p.title,
        caption: p.caption,
        tags: p.tags,
      })),
    };
  });
});
</script>

<template>
  <div class="city-view">
    <div class="city-view__head">
      <div class="city-view__eyebrow">{{ $t('City') }}</div>
      <h2 class="city-view__title">
        {{ city.name }}<span v-if="countryName" class="city-view__country"> · {{ countryName }}</span>
      </h2>
    </div>

    <TravelTimeline
      :entries="timelineEntries"
      :empty-text="$t('No places recorded for this city yet.')"
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

  &__country {
    font-size: rem(20);
    font-weight: 400;
    color: $text-secondary;
    letter-spacing: -0.01em;
  }
}
</style>
