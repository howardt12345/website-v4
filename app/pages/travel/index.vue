<script setup lang="ts">
import { tripCountryNames, daySpan, formatTripRange, formatDayLabel } from '~/composables/travel';
import { usei18n } from '~/store/i18n.store';
import { useTravelStore } from '~/store/travel.store';
import { usePhotoItems } from '~/composables/photos';
import { useMediaQueries } from '~/composables/media-queries';

definePageMeta({ layout: 'default' });

const travelStore = useTravelStore();

const { allPhotos } = usePhotoItems();
watchEffect(() => travelStore.setPhotos(allPhotos.value));

await travelStore.hydrate();

const {
  view,
  focusCountry,
  focusTrip,
  activeDay,
  mapMode,
  mapProps,
  railProps,
  statsBarProps,
  dayViewProps,
  tripOverviewProps,
  cityViewProps,
  citiesOverviewProps,
  loadError,
} = storeToRefs(travelStore);

const { navWorld, navCountry, navCity, navTripDayCity, navTrip, pickDay, pickStop, countryByIso3, reload } = travelStore;

const handleCityClick = (loc: { country: string; city: string }) => {
  if (view.value === 'trip' && activeDay.value) {
    navTripDayCity(activeDay.value.date, loc.country, loc.city);
  } else {
    navCity(loc.country, loc.city);
  }
};

const i18n = usei18n();
const { currentLanguage } = storeToRefs(i18n);
const { t } = i18n;

const pageTitle = (): string => {
  if (view.value === 'trip' && focusTrip.value) {
    return activeDay.value
      ? `${formatDayLabel(activeDay.value.date, currentLanguage.value)} — ${focusTrip.value.title} · Travel · Howard Tseng`
      : `${focusTrip.value.title} · Travel · Howard Tseng`;
  }
  if (cityViewProps.value) return `${cityViewProps.value.city.name} · Travel · Howard Tseng`;
  if (focusCountry.value) return `${focusCountry.value.name} · Travel · Howard Tseng`;
  return 'Travel · Howard Tseng';
};
const pageDescription = (): string =>
  focusTrip.value?.excerpt ?? 'An interactive log of countries, cities, and places — from Taiwan to Japan to Europe.';
const pageImage = computed<string | undefined>(() => {
  const dayEntry = activeDay.value
    ? tripOverviewProps.value.days.find((d) => d.day.date === activeDay.value!.date)
    : undefined;
  if (dayEntry?.photos[0]) return dayEntry.photos[0].photo.url;
  for (const d of tripOverviewProps.value.days) {
    if (d.photos[0]) return d.photos[0].photo.url;
  }
  return undefined;
});

const siteUrl = useRuntimeConfig().public.siteUrl as string;

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: 'website',
  ogImage: () => {
    if (!siteUrl) return undefined;
    return pageImage.value ? `${siteUrl}${pageImage.value}` : `${siteUrl}/images/og-default.jpg`;
  },
});

const tripCountryPairs = computed(() =>
  (focusTrip.value?.countries ?? []).map((iso3) => ({ iso3, name: countryByIso3(iso3)?.name ?? iso3 })),
);

const { isMobile, isNarrow } = useMediaQueries();

// Prerendered without a viewport, so defer the mobile swap until after hydration to keep SSR and first client render identical.
const hydrated = ref(false);
onMounted(() => { hydrated.value = true; });
const mobileLayout = computed(() => hydrated.value && isMobile.value);

const railCollapsed = ref(false);
watch(isNarrow, (narrow) => {
  if (narrow) railCollapsed.value = false;
});

const stageClass = computed(() => ({
  'travel-stage--collapsed': railCollapsed.value,
}));

const contentRef = ref<HTMLElement | null>(null);
let mounted = false;
onMounted(() => nextTick(() => { mounted = true; }));
watch(
  () => activeDay.value?.date,
  async (date) => {
    if (!mounted || !date) return;
    await nextTick();
    if (!contentRef.value) return;
    const prefersReducedMotion = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    contentRef.value.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    contentRef.value.focus({ preventScroll: true });
  },
);
</script>

<template>
  <div class="travel-page content-container">
    <TravelBreadcrumb
      :country="focusCountry"
      :trip="focusTrip"
      :city-name="cityViewProps?.city.name"
      :trip-countries="tripCountryPairs"
      @nav-world="navWorld"
      @nav-country="navCountry"
    />

    <div class="travel-page__header">
      <template v-if="view === 'trip' && focusTrip">
        <h1 class="travel-page__title">{{ focusTrip.title }}</h1>
        <div class="travel-page__eyebrow">
          {{ tripCountryNames(focusTrip, countryByIso3).join(' → ') }}
          · {{ daySpan(focusTrip) }} {{ $t('days') }}
          · {{ formatTripRange(focusTrip, currentLanguage) }}
        </div>
        <p class="travel-page__subtitle">{{ focusTrip.excerpt }}</p>
      </template>
      <template v-else>
        <h1 class="travel-page__title">{{ $t('Travel') }}</h1>
        <p class="travel-page__subtitle">
          {{ $t('Countries visited, cities explored, and days logged on the road.') }}
        </p>
      </template>
    </div>

    <p class="sr-only">
      {{ t('The map is interactive with a mouse; all destinations are also reachable from the timeline and city lists below.') }}
    </p>

    <CommonRetryPanel
      v-if="loadError"
      class="travel-page__error"
      :message="$t('Could not load travel data.')"
      @retry="reload"
    />

    <div v-if="!loadError" class="travel-stage" :class="stageClass">
      <div class="travel-stage__map">
        <ClientOnly>
          <LazyTravelMap
            v-bind="mapProps"
            @country-click="navCountry"
            @place-click="pickStop"
            @city-click="handleCityClick"
          />
          <template #fallback>
            <div class="travel-stage__map-fallback" aria-hidden="true">
              <v-skeleton-loader type="image" height="100%" />
            </div>
          </template>
        </ClientOnly>

        <div v-if="!mobileLayout" class="travel-stage__overlay">
          <TravelStatsBar v-bind="statsBarProps" />
          <v-btn
            v-if="view === 'trip' && focusTrip?.blogSlug"
            :to="`/blog/${focusTrip.blogSlug}`"
            variant="text"
            size="small"
            class="travel-stage__blog-link"
          >
            {{ $t('Read trip writeup') }} →
          </v-btn>
        </div>

        <v-btn-toggle
          v-model="mapMode"
          class="travel-stage__controls"
          mandatory
          density="compact"
          variant="text"
        >
          <v-btn value="flat" size="small">{{ $t('Flat') }}</v-btn>
          <v-btn value="globe" size="small">{{ $t('Globe') }}</v-btn>
        </v-btn-toggle>
      </div>

      <TravelStatsBar v-if="mobileLayout" v-bind="statsBarProps" class="travel-stage__stats-mobile" />

      <v-btn
        v-if="mobileLayout && view === 'trip' && focusTrip?.blogSlug"
        :to="`/blog/${focusTrip.blogSlug}`"
        variant="text"
        size="small"
        class="travel-stage__blog-link travel-stage__blog-link--mobile"
      >
        {{ $t('Read trip writeup') }} →
      </v-btn>

      <TravelSideRail
        v-bind="railProps"
        v-model:collapsed="railCollapsed"
        @pick-trip="navTrip"
        @pick-day="pickDay"
      />
    </div>

    <div v-if="!loadError" ref="contentRef" class="travel-page__content" tabindex="-1">
      <TravelDayView
        v-if="dayViewProps"
        v-bind="dayViewProps"
        @update:active-place="pickStop"
        @city-click="handleCityClick"
      />
      <TravelTripOverview
        v-else-if="view === 'trip' && focusTrip"
        v-bind="tripOverviewProps"
        @pick-day="pickDay"
      />
      <TravelCityView
        v-else-if="cityViewProps"
        v-bind="cityViewProps"
      />
      <TravelCitiesOverview
        v-else-if="citiesOverviewProps"
        v-bind="citiesOverviewProps"
        @city-click="navCity"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.travel-page {
  padding-top: rem(20);

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

  &__eyebrow {
    display: flex;
    align-items: center;
    gap: rem(10);
    font-size: rem(11);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $accent;
    margin-top: rem(10);
    margin-bottom: rem(10);

    &::before {
      content: '';
      display: inline-block;
      width: rem(22);
      height: 1px;
      background: $accent;
      flex-shrink: 0;
    }
  }

  &__subtitle {
    color: $text-secondary;
    margin-top: rem(14);
    font-size: rem(16);
    line-height: 1.6;
    margin-bottom: 0;
  }

  &__content {
    outline: none;
  }

  &__error {
    margin-bottom: rem(32);
  }
}

.travel-stage {
  display: grid;
  grid-template-columns: 1fr rem(300);
  gap: rem(12);
  height: clamp(#{rem(600)}, calc(100vh - #{rem(360)}), #{rem(900)});
  margin-bottom: rem(32);

  @media (min-width: 961px) {
    &--collapsed {
      grid-template-columns: 1fr rem(44);
    }
  }

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    height: auto;
  }
}

.travel-stage__map {
  position: relative;
  height: 100%;
  border-radius: rem(8);
  overflow: hidden;
  border: 1px solid $border-color;
  background: rgb(var(--v-theme-surface));

  @media (max-width: 960px) {
    height: rem(300);
  }
}

.travel-stage__map-fallback {
  position: absolute;
  inset: 0;

  :deep(.v-skeleton-loader__image) {
    height: 100%;
    border-radius: 0;
  }
}

.travel-stage__overlay {
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

.travel-stage__stats-mobile {
  padding: rem(4) rem(2);
}

.travel-stage__controls {
  position: absolute;
  top: rem(14);
  right: rem(14);
  background: $background-glass;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid $border-color;
  border-radius: rem(8);
  overflow: hidden;
}

.travel-stage__blog-link {
  color: $accent;
  letter-spacing: normal;
  text-transform: none;
  font-size: rem(13);
  align-self: flex-start;
  padding-left: 0;

  &--mobile {
    justify-self: start;
  }
}
</style>
