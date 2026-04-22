<script setup lang="ts">
import type { TravelTrip, TravelDay, TravelCountry, TravelPhoto } from '~/composables/travel';
import { tripsForCountry, tripSlug } from '~/composables/travel';
import { useTravelNavigation } from '~/composables/useTravelNavigation';
import { useTravelStore } from '~/store/travel.store';

definePageMeta({ layout: 'default' });

useSeoMeta({
  title: 'Travel · Howard Tseng',
  description: 'An interactive log of countries, cities, and places — from Taiwan to Japan to Europe.',
});

const travelStore = useTravelStore();

const { data: rawCountries } = await useAsyncData('travel-countries', () =>
  queryCollection('travelCountries').all(),
);

const { data: rawTrips } = await useAsyncData('travel-trips', () =>
  queryCollection('travelTrips').order('start', 'DESC').all(),
);

const { data: rawDays } = await useAsyncData('travel-days', () =>
  queryCollection('travelDays').order('date', 'ASC').all(),
);

const { data: rawPhotoFolders } = await useAsyncData('photo-folders', () =>
  queryCollection('photoFolders').all(),
);

const { data: rawTravelPhotos } = await useAsyncData('travel-photos', () =>
  queryCollection('photos').order('stem', 'ASC').all(),
);

watch(rawCountries, (countries) => {
  if (countries?.length) {
    travelStore.setCountries(countries as unknown as TravelCountry[]);
  }
}, { immediate: true });

const allTrips = computed<TravelTrip[]>(() =>
  (rawTrips.value ?? []) as unknown as TravelTrip[],
);

const allDays = computed<TravelDay[]>(() =>
  (rawDays.value ?? []) as unknown as TravelDay[],
);

const {
  focusCountryIso3,
  activeDayIndex,
  activePlaceIndex,
  mapMode,
  view,
  focusTrip,
  navWorld,
  navCountry,
  navTrip,
  onDayPick,
} = useTravelNavigation(allTrips);

const focusCountry = computed<TravelCountry | undefined>(() =>
  focusCountryIso3.value ? travelStore.countryByIso3(focusCountryIso3.value) : undefined,
);

const tripDays = computed<TravelDay[]>(() => {
  if (!focusTrip.value) return [];
  const prefix = tripSlug(focusTrip.value) + '/days/';
  return allDays.value.filter((d) => d.stem.startsWith(prefix));
});

const activeDay = computed<TravelDay | undefined>(() => tripDays.value[activeDayIndex.value]);

const countryTrips = computed<TravelTrip[]>(() =>
  focusCountry.value ? tripsForCountry(allTrips.value, focusCountry.value.iso3) : [],
);

const multiCountry = computed(() => (focusTrip.value?.countries.length ?? 0) > 1);

const tripDayCount = computed(() => tripDays.value.length);

const tripCityCount = computed(() =>
  new Set(
    tripDays.value.flatMap((d) =>
      d.places.map((p) => `${p.country ?? d.country}/${p.city ?? d.city}`),
    ),
  ).size,
);

const photosByPlace = computed<Record<string, Record<string, TravelPhoto[]>>>(() => {
  const folderMap = new Map(
    (rawPhotoFolders.value ?? []).map((f) => [f.stem.replace(/\/index$/, ''), f]),
  );
  const result: Record<string, Record<string, TravelPhoto[]>> = {};
  for (const raw of (rawTravelPhotos.value ?? [])) {
    const folderPath = raw.stem.split('/').slice(0, -1).join('/');
    const folder = folderMap.get(folderPath);
    if (!folder?.tripId || !folder?.placeSlug) continue;
    const { tripId, placeSlug } = folder;
    if (!result[tripId]) result[tripId] = {};
    if (!result[tripId][placeSlug]) result[tripId][placeSlug] = [];
    result[tripId][placeSlug].push({
      url: `/${raw.stem}.${raw.ext ?? 'jpg'}`,
      title: raw.title,
      caption: raw.caption,
      alt: raw.alt,
      featured: raw.featured ?? false,
      tags: raw.tags ?? folder.tags ?? [],
    });
  }
  return result;
});

const activeTripId = computed(() =>
  focusTrip.value ? tripSlug(focusTrip.value).replace('travel/', '') : '',
);

const tripPhotosMap = computed<Record<string, TravelPhoto[]>>(() =>
  photosByPlace.value[activeTripId.value] ?? {},
);

const tripPhotoCount = computed(() =>
  Object.values(tripPhotosMap.value).reduce((sum, photos) => sum + photos.length, 0),
);

const mapFocusCountries = computed<string[]>(() => {
  if (view.value === 'country' && focusCountry.value) return [focusCountry.value.iso3];
  if (view.value === 'trip' && focusTrip.value) return focusTrip.value.countries;
  return [];
});

const mapVisitedHues = computed<Record<string, number>>(() =>
  Object.fromEntries(travelStore.countries.map((c) => [c.iso3, c.hue])),
);

const mapVisitedRegions = computed<string[]>(() =>
  mapFocusCountries.value.flatMap((iso3) => travelStore.countryByIso3(iso3)?.regions ?? []),
);

const mapTripPath = computed<{ lon: number; lat: number }[] | null>(() => {
  if (view.value !== 'trip' || !tripDays.value.length) return null;
  return tripDays.value.flatMap((d) => d.places.map((p) => ({ lon: p.lon, lat: p.lat })));
});

const mapPlacePins = computed(() => {
  if (view.value !== 'trip' || !activeDay.value) return [];
  return activeDay.value.places.map((p, i) => ({
    lon: p.lon,
    lat: p.lat,
    label: p.name,
    active: i === activePlaceIndex.value,
  }));
});

const mapCityPins = computed(() => {
  if (view.value !== 'country' || !focusCountry.value) return [];
  return focusCountry.value.cities.map((c) => ({ lon: c.lon, lat: c.lat, name: c.name }));
});
</script>

<template>
  <div class="travel-page content-container">
    <div class="travel-page__header">
      <h1 class="travel-page__title">{{ $t('Travel') }}</h1>
      <p class="travel-page__subtitle">
        {{ $t('Countries visited, cities explored, and days logged on the road.') }}
      </p>
    </div>

    <TravelBreadcrumb
      :country="focusCountry"
      :trip="focusTrip"
      @navWorld="navWorld"
      @navCountry="navCountry"
    />

    <div class="travel-hero">
      <TravelMap
        class="travel-hero__map"
        :mode="mapMode"
        :focusCountries="mapFocusCountries"
        :visitedHues="mapVisitedHues"
        :visitedRegions="mapVisitedRegions"
        :tripPath="mapTripPath"
        :placePins="mapPlacePins"
        :cityPins="mapCityPins"
        @countryClick="navCountry"
        @placeClick="activePlaceIndex = $event"
      />

      <div class="travel-hero__overlay">
        <TravelStatsBar
          :view
          :trips="allTrips"
          :country="focusCountry"
          :trip="focusTrip"
          :tripDayCount
          :tripPhotoCount
          :tripCityCount
        />
        <v-btn
          v-if="view === 'trip' && focusTrip?.blogSlug"
          :to="`/blog/${focusTrip.blogSlug}`"
          variant="text"
          size="small"
          class="travel-hero__blog-link"
        >
          {{ $t('Read trip writeup') }} →
        </v-btn>
      </div>

      <v-btn-toggle
        v-model="mapMode"
        class="travel-hero__controls"
        mandatory
        density="compact"
        variant="outlined"
        rounded="lg"
      >
        <v-btn value="flat" size="small">{{ $t('Flat') }}</v-btn>
        <v-btn value="globe" size="small">{{ $t('Globe') }}</v-btn>
      </v-btn-toggle>
    </div>

    <template v-if="view === 'world'">
      <TravelTimelineRibbon
        :trips="allTrips"
        :activeId="null"
        @pick="navTrip"
      />
    </template>

    <template v-else-if="view === 'country'">
      <TravelTimelineVert
        :trips="countryTrips"
        :activeId="null"
        @pick="navTrip"
      />
    </template>

    <template v-else-if="view === 'trip' && focusTrip">
      <TravelTripHeader :trip="focusTrip" />
      <TravelDayRibbon
        :days="tripDays"
        :activeIndex="activeDayIndex"
        :multiCountry
        @pick="onDayPick"
      />
      <TravelDayView
        v-if="activeDay"
        :day="activeDay"
        :activePlace="activePlaceIndex"
        :multiCountry
        :photosMap="tripPhotosMap"
        @update:activePlace="activePlaceIndex = $event"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.travel-page {
  padding-top: rem(48);
  padding-bottom: rem(96);

  &__header {
    margin-bottom: rem(24);
  }

  &__title {
    font-size: clamp(#{rem(44)}, 6vw, #{rem(68)});
    line-height: 1.02;
    letter-spacing: -0.025em;
    font-weight: 300;
    color: $text;
    margin: 0;
  }

  &__subtitle {
    color: $text-secondary;
    margin-top: rem(14);
    font-size: rem(16);
    line-height: 1.6;
    margin-bottom: 0;
  }
}

.travel-hero {
  position: relative;
  width: 100%;
  height: rem(480);
  border-radius: rem(20);
  overflow: hidden;
  border: 1px solid $border-color;
  margin-bottom: rem(32);
  background: rgb(var(--v-theme-surface));

  &__map {
    width: 100%;
    height: 100%;
  }

  &__overlay {
    position: absolute;
    bottom: rem(20);
    right: rem(20);
    display: flex;
    flex-direction: column;
    gap: rem(10);
    background: $background-glass;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid $border-color;
    border-radius: rem(14);
    padding: rem(14) rem(18);
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }

  &__controls {
    position: absolute;
    top: rem(14);
    left: rem(14);
    background: $background-glass;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  &__blog-link {
    color: $accent;
    letter-spacing: normal;
    text-transform: none;
    font-size: rem(13);
    align-self: flex-start;
    padding-left: 0;
  }
}
</style>
