<script setup lang="ts">
import type { TravelTrip, TravelDay, TripOverviewDay, TravelTimelineEntry } from '~/types/travel';
import { formatDayLabel, dayUniqueCities, dayUniqueIso3s } from '~/composables/travel';
import { useTravelStore } from '~/store/travel.store';
import { usei18n } from '~/store/i18n.store';

interface Props {
  trip?: TravelTrip;
  days: TripOverviewDay[];
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'pick-day': [idx: number] }>();

const { cityById, countryByIso3 } = useTravelStore();
const { currentLanguage } = storeToRefs(usei18n());

const dayCityLabel = (day: TravelDay): string =>
  dayUniqueCities(day)
    .map((loc) => cityById(loc.country, loc.city)?.name ?? loc.city)
    .join(' → ');

const dayCountryLabel = (day: TravelDay): string =>
  dayUniqueIso3s(day)
    .map((iso3) => countryByIso3(iso3)?.name ?? iso3)
    .join(' → ');

const timelineEntries = computed<TravelTimelineEntry[]>(() =>
  props.days.map((item) => {
    const photographed = new Set(item.photos.map((p) => p.placeName));
    const alsoVisited = item.day.places
      .filter((p) => !photographed.has(p.name))
      .map((p) => p.name);

    return {
      key: item.day.date,
      eyebrow: '',
      title: dayCityLabel(item.day),
      titleSub: dayCountryLabel(item.day),
      dividerBefore: formatDayLabel(item.day.date, currentLanguage.value),
      photos: item.photos.map((e) => ({
        url: e.photo.url,
        alt: e.photo.alt ?? e.photo.title ?? e.placeName,
        label: e.placeName,
        title: e.photo.title,
        caption: e.photo.caption,
        tags: e.photo.tags,
      })),
      onClick: () => emit('pick-day', item.dayIndex),
      noPhotoPlaces: item.photos.length === 0 ? item.day.places.map((p) => p.name) : undefined,
      alsoVisited: item.photos.length > 0 && alsoVisited.length > 0 ? alsoVisited : undefined,
    };
  }),
);
</script>

<template>
  <div class="trip-overview">
    <div class="trip-overview__head">
      <div class="trip-overview__eyebrow">{{ $t('The whole trip') }}</div>
      <h2 class="trip-overview__title">{{ $t('All photos') }}</h2>
    </div>
    <TravelTimeline :entries="timelineEntries" />
  </div>
</template>

<style scoped lang="scss">
.trip-overview {
  margin-top: rem(8);
}

.trip-overview__head {
  margin-bottom: rem(28);
}

.trip-overview__eyebrow {
  font-size: rem(11);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: $text-secondary;
  font-weight: 600;
  margin-bottom: rem(6);
  opacity: 0.7;
}

.trip-overview__title {
  font-size: rem(28);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 500;
  color: $text;
  margin: 0;
}
</style>
