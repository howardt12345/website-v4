<script setup lang="ts">
import type { TravelTrip, TravelCountry, TravelView } from '~/types/travel';
import { daySpan, tripsForCountry } from '~/composables/travel';
import { usei18n } from '~/store/i18n.store';
import { useTravelStore } from '~/store/travel.store';
import { COUNTRY_SUBDIVISION_META, WORLD_COUNTRY_TOTAL } from '~/utils/travel-geo';

interface Props {
  view: TravelView;
  trips: TravelTrip[];
  country?: TravelCountry;
  trip?: TravelTrip;
  countryDayCount?: number;
  tripDayCount?: number;
  tripPhotoCount?: number;
  tripCityCount?: number;
}

interface StatItem {
  value: number;
  total?: number;
  label: string;
}

const props = defineProps<Props>();
const { countries } = storeToRefs(useTravelStore());
const { t } = usei18n();

const stats = computed((): StatItem[] => {
  if (props.view === 'world') {
    return [
      { value: countries.value.length, total: WORLD_COUNTRY_TOTAL, label: t('countries') },
      { value: countries.value.reduce((sum, c) => sum + c.cities.length, 0), label: t('cities') },
      { value: props.trips.length, label: t('trips') },
      { value: props.trips.reduce((sum, trip) => sum + daySpan(trip), 0), label: t('days on the road') },
    ];
  }

  if (props.view === 'country' && props.country) {
    const countryTrips = tripsForCountry(props.trips, props.country.iso3);
    const subdivisionMeta = COUNTRY_SUBDIVISION_META[props.country.iso3];
    const items: StatItem[] = [
      { value: countryTrips.length, label: t('trips') },
      { value: props.country.cities.length, label: t('cities') },
      { value: props.countryDayCount ?? 0, label: t('days logged') },
    ];
    if (subdivisionMeta && props.country.regions.length > 0) {
      items.push({
        value: props.country.regions.length,
        total: subdivisionMeta.total,
        label: t(subdivisionMeta.label),
      });
    }
    return items;
  }

  if (props.view === 'trip' && props.trip) {
    return [
      { value: daySpan(props.trip), label: t('days') },
      { value: props.tripDayCount ?? 0, label: t('days logged') },
      { value: props.tripCityCount ?? 0, label: t('cities') },
      { value: props.tripPhotoCount ?? 0, label: t('photos') },
    ];
  }

  return [];
});
</script>

<template>
  <div class="travel-stats">
    <div v-for="stat in stats" :key="stat.label" class="travel-stats__item">
      <span class="travel-stats__num">
        {{ stat.value }}
        <span v-if="stat.total != null" class="travel-stats__total"> / {{ stat.total }}</span>
      </span>
      <span class="travel-stats__label">{{ stat.label }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.travel-stats {
  display: flex;
  gap: rem(22);

  &__item {
    display: flex;
    flex-direction: column;
    gap: rem(2);
  }

  &__num {
    font-size: rem(22);
    line-height: 1;
    color: $text;
    font-variant-numeric: tabular-nums;
    font-weight: 500;
  }

  &__total {
    font-size: rem(14);
    font-weight: 400;
    color: $text-secondary;
    opacity: 0.6;
  }

  &__label {
    font-size: rem(10);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: $text-secondary;
    opacity: 0.7;
  }
}
</style>
