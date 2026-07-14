<script setup lang="ts">
import type { TravelDay, TravelPlace } from '~/types/travel';
import type { PhotoItem } from '~/types/photos';
import {
  formatDayLabel,
  dayUniqueCities,
  dayUniqueIso3s,
  dayNeighborhoods,
  placeCountry,
  visiblePlaces,
} from '~/composables/travel';
import { usei18n } from '~/store/i18n.store';
import { useTravelStore } from '~/store/travel.store';

interface Props {
  day: TravelDay;
  activePlace: number;
  multiCountry: boolean;
  photosMap?: Record<string, PhotoItem[]>;
}

const props = defineProps<Props>();
defineEmits<{
  'update:activePlace': [index: number];
  'city-click': [loc: { country: string; city: string }];
}>();

const { cityById, countryByIso3 } = useTravelStore();
const { currentLanguage } = storeToRefs(usei18n());

// Must match mapPlacePins' list in the travel store, so index i lines up with activePlaceIndex.
const places = computed(() => visiblePlaces(props.day));
const uniqueCities = computed(() => dayUniqueCities(props.day));
const isMultiCityDay = computed(() => uniqueCities.value.length > 1);
const isMultiCountryDay = computed(() => dayUniqueIso3s(props.day).length > 1);
// Only meaningful for a single-city day — dayTitle() itself falls back to plain
// city names once a day spans more than one city, so the button list above covers that case.
const neighborhoods = computed(() => (isMultiCityDay.value ? [] : dayNeighborhoods(props.day)));

const dayCountryNames = computed(() =>
  dayUniqueIso3s(props.day).map((iso3) => countryByIso3(iso3)?.name ?? iso3),
);

const dayDefaultCountry = computed(() => props.day.countries[0] ?? null);

const placeHue = (place: TravelPlace): number =>
  countryByIso3(placeCountry(props.day, place))?.hue ?? 200;

const photosForPlace = (place: TravelPlace): PhotoItem[] => {
  const all = place.id ? (props.photosMap?.[place.id] ?? []) : [];
  const dated = all.filter((p) => p.date === props.day.date);
  return dated.length > 0 ? dated : all.filter((p) => !p.date);
};
</script>

<template>
  <div class="day-view">
    <div class="day-view__head">
      <div>
        <div class="day-view__date-label">{{ formatDayLabel(day.date, currentLanguage) }}</div>
        <div class="day-view__city">
          <template v-if="isMultiCityDay">
            <span
              v-for="(loc, idx) in uniqueCities"
              :key="`${loc.country}/${loc.city}`"
            >
              <span v-if="idx > 0" class="day-view__city-sep"> → </span>
              <button
                type="button"
                class="day-view__city-link"
                @click="$emit('city-click', { country: loc.country, city: loc.city })"
              >{{ cityById(loc.country, loc.city)?.name ?? loc.city }}</button>
            </span>
          </template>
          <button
            v-else-if="dayDefaultCountry"
            type="button"
            class="day-view__city-link"
            @click="$emit('city-click', { country: dayDefaultCountry, city: day.city })"
          >{{ cityById(dayDefaultCountry, day.city)?.name }}</button>
          <span v-if="neighborhoods.length" class="day-view__neighborhoods">: {{ neighborhoods.join(' → ') }}</span>
          <span v-if="multiCountry || isMultiCountryDay" class="day-view__country">
            <span class="day-view__country-dot">·</span>{{ dayCountryNames.join(' → ') }}
          </span>
        </div>
      </div>
    </div>

    <div class="day-view__layout">
      <div class="day-view__places">
        <TravelPlaceItem
          v-for="(place, i) in places"
          :key="place.id ?? place.name"
          :place
          :index="i"
          :active="i === activePlace"
          :photoCount="photosForPlace(place).length"
          @pick="$emit('update:activePlace', $event)"
        />
      </div>

      <div class="day-view__sections">
        <template v-for="(place, i) in places" :key="place.id ?? place.name">
          <TravelPhotoSection
            v-show="i === activePlace"
            :place
            :placeIndex="i"
            :totalPlaces="places.length"
            :baseHue="placeHue(place)"
            :photos="photosForPlace(place)"
            @nav-stop="$emit('update:activePlace', $event)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.day-view {
  display: flex;
  flex-direction: column;
  gap: rem(20);

  &__head {
    padding-bottom: rem(18);
    border-bottom: 1px solid $border-color;
  }

  &__date-label {
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $text-secondary;
    font-weight: 600;
    margin-bottom: rem(6);
    opacity: 0.7;
  }

  &__city {
    font-size: rem(28);
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-weight: 500;
    color: $text;
  }

  &__city-link {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.7;
    }

    &:focus-visible {
      outline: 2px solid $accent;
      outline-offset: 2px;
    }
  }

  &__neighborhoods {
    color: $text-secondary;
    font-size: rem(22);
    font-weight: 400;
  }

  &__country {
    color: $text-secondary;
    font-size: rem(22);
    font-weight: 400;
  }

  &__country-dot {
    margin-inline: rem(8);
  }

  &__layout {
    display: grid;
    grid-template-columns: rem(240) 1fr;
    gap: rem(24);
    align-items: start;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  }

  &__places {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  &__sections {
    display: flex;
    flex-direction: column;
  }
}
</style>
