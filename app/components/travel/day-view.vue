<script setup lang="ts">
import type { TravelDay, TravelPlace, TravelPhoto } from '~/types/travel';
import { formatDayLabel, dayUniqueCities, dayUniqueIso3s } from '~/composables/travel';
import { usei18n } from '~/store/i18n.store';
import { useTravelStore } from '~/store/travel.store';

interface Props {
  day: TravelDay;
  activePlace: number;
  multiCountry: boolean;
  photosMap?: Record<string, TravelPhoto[]>;
}

const props = defineProps<Props>();
defineEmits<{ 'update:activePlace': [index: number] }>();

const { cityById, countryByIso3 } = useTravelStore();
const { currentLanguage } = storeToRefs(usei18n());

const uniqueCities = computed(() => dayUniqueCities(props.day));
const isMultiCityDay = computed(() => uniqueCities.value.length > 1);
const isMultiCountryDay = computed(() => dayUniqueIso3s(props.day).length > 1);

const dayCountryNames = computed(() =>
  dayUniqueIso3s(props.day).map((iso3) => countryByIso3(iso3)?.name ?? iso3),
);

const placeHue = (place: TravelPlace): number =>
  countryByIso3(place.country ?? props.day.country)?.hue ?? 200;

const photosForPlace = (place: TravelPlace): TravelPhoto[] =>
  place.id ? (props.photosMap?.[place.id] ?? []) : [];
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
              {{ cityById(loc.country, loc.city)?.name ?? loc.city }}
            </span>
          </template>
          <template v-else>
            {{ cityById(day.country, day.city)?.name }}
          </template>
          <span v-if="multiCountry || isMultiCountryDay" class="day-view__country">
            · {{ dayCountryNames.join(' → ') }}
          </span>
        </div>
      </div>
    </div>

    <div class="day-view__layout">
      <div class="day-view__places">
        <TravelPlaceItem
          v-for="(place, i) in day.places"
          :key="place.name"
          :place
          :index="i"
          :active="i === activePlace"
          :photoCount="photosForPlace(place).length"
          @pick="$emit('update:activePlace', $event)"
        />
      </div>

      <div class="day-view__sections">
        <template v-for="(place, i) in day.places" :key="place.name">
          <TravelPhotoSection
            v-show="i === activePlace"
            :place
            :placeIndex="i"
            :totalPlaces="day.places.length"
            :baseHue="placeHue(place)"
            :photos="photosForPlace(place)"
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

  &__country {
    color: $text-secondary;
    font-size: rem(22);
    margin-left: rem(8);
    font-weight: 400;
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
