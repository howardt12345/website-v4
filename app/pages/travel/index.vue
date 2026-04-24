<script setup lang="ts">
import { tripCountryNames, daySpan, formatTripRange } from '~/composables/travel';
import { usei18n } from '~/store/i18n.store';
import { useTravelStore } from '~/store/travel.store';

definePageMeta({ layout: 'default' });

useSeoMeta({
  title: 'Travel · Howard Tseng',
  description: 'An interactive log of countries, cities, and places — from Taiwan to Japan to Europe.',
});

const travelStore = useTravelStore();
await travelStore.hydrate();

const {
  view,
  focusCountry,
  focusTrip,
  activeDay,
  activePlaceIndex,
  activeCityFocus,
  mapMode,
  mapProps,
  railProps,
  statsBarProps,
  dayViewProps,
  tripOverviewProps,
  cityViewProps,
} = storeToRefs(travelStore);

const { navWorld, navCountry, navCity, navTripDayCity, navTrip, pickDay } = travelStore;

const handleCityClick = (loc: { country: string; city: string }) => {
  if (view.value === 'trip' && activeDay.value) {
    navTripDayCity(activeDay.value.date, loc.country, loc.city);
  } else {
    navCity(loc.country, loc.city);
  }
};

const { currentLanguage } = storeToRefs(usei18n());

const railCollapsed = ref(false);

const stageClass = computed(() => ({
  'travel-stage--collapsed': railCollapsed.value,
}));
</script>

<template>
  <div class="travel-page content-container">
    <TravelBreadcrumb
      :country="focusCountry"
      :trip="focusTrip"
      @navWorld="navWorld"
      @navCountry="navCountry"
    />

    <div class="travel-page__header">
      <template v-if="view === 'trip' && focusTrip">
        <h1 class="travel-page__title">{{ focusTrip.title }}</h1>
        <div class="travel-page__eyebrow">
          {{ tripCountryNames(focusTrip).join(' → ') }}
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

    <div class="travel-stage" :class="stageClass">
      <div class="travel-stage__map">
        <TravelMap
          v-bind="mapProps"
          @countryClick="navCountry"
          @placeClick="activePlaceIndex = $event"
          @cityClick="handleCityClick"
        />

        <div class="travel-stage__overlay">
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
          variant="outlined"
          rounded="lg"
        >
          <v-btn value="flat" size="small">{{ $t('Flat') }}</v-btn>
          <v-btn value="globe" size="small">{{ $t('Globe') }}</v-btn>
        </v-btn-toggle>
      </div>

      <TravelSideRail
        v-bind="railProps"
        v-model:collapsed="railCollapsed"
        @pick-trip="navTrip"
        @pick-day="pickDay"
      />
    </div>

    <TravelDayView
      v-if="view === 'trip' && activeDay"
      v-bind="dayViewProps"
      @update:activePlace="activePlaceIndex = $event"
      @cityClick="handleCityClick"
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
  </div>
</template>

<style scoped lang="scss">
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
    height: rem(380);
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

.travel-stage__controls {
  position: absolute;
  top: rem(14);
  right: rem(14);
  background: $background-glass;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.travel-stage__blog-link {
  color: $accent;
  letter-spacing: normal;
  text-transform: none;
  font-size: rem(13);
  align-self: flex-start;
  padding-left: 0;
}
</style>
