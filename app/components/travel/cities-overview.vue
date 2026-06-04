<script setup lang="ts">
import type { CityVisitSummary } from '~/types/travel';
import { formatDayShort } from '~/composables/travel';
import { usei18n } from '~/store/i18n.store';
import { loadRegionNames } from '~/utils/province-geo';

const props = defineProps<{
  summaries: CityVisitSummary[];
}>();

const emit = defineEmits<{
  'city-click': [iso3: string, cityId: string];
}>();

const i18n = usei18n();
const { currentLanguage } = storeToRefs(i18n);
const { t } = i18n;

const nDays = (n: number) => t('{{n}} days', { n });
const nTrips = (n: number) => t('{{n}} trips', { n });
const nPlaces = (n: number) => t('{{n}} places', { n });

const regionNameMap = ref<Map<string, string>>(new Map());

watchEffect(async () => {
  const iso3Set = new Set(props.summaries.map((s) => s.country.iso3));
  const records = await Promise.all([...iso3Set].map(loadRegionNames));
  const merged = new Map<string, string>();
  for (const record of records) {
    for (const [code, name] of Object.entries(record)) merged.set(code, name);
  }
  regionNameMap.value = merged;
});

interface RegionGroup {
  code: string;
  name: string;
  cities: CityVisitSummary[];
}

interface CountryGroup {
  iso3: string;
  name: string;
  regions: RegionGroup[];
  hasMultipleRegions: boolean;
}

const countryGroups = computed<CountryGroup[]>(() => {
  const countryMap = new Map<string, { iso3: string; name: string; regionMap: Map<string, CityVisitSummary[]> }>();

  for (const summary of props.summaries) {
    const { iso3, name } = summary.country;
    if (!countryMap.has(iso3)) countryMap.set(iso3, { iso3, name, regionMap: new Map() });
    const country = countryMap.get(iso3)!;
    const regionCode = summary.city.region || '__none__';
    if (!country.regionMap.has(regionCode)) country.regionMap.set(regionCode, []);
    country.regionMap.get(regionCode)!.push(summary);
  }

  return [...countryMap.values()].map(({ iso3, name, regionMap }) => {
    const regions: RegionGroup[] = [...regionMap.entries()].map(([code, cities]) => ({
      code,
      name: code === '__none__' ? '' : (regionNameMap.value.get(code) ?? code),
      cities,
    }));
    return { iso3, name, regions, hasMultipleRegions: regions.length > 1 };
  });
});
</script>

<template>
  <div class="cities-overview">
    <div class="cities-overview__head">
      <div class="cities-overview__eyebrow">{{ $t('Visited Cities') }}</div>
    </div>

    <div
      v-for="group in countryGroups"
      :key="group.iso3"
      class="cities-overview__group"
    >
      <div class="cities-overview__group-header">
        <span class="cities-overview__group-label">{{ group.name }}</span>
      </div>

      <template v-if="group.hasMultipleRegions">
        <div
          v-for="region in group.regions"
          :key="region.code"
          class="cities-overview__region"
        >
          <div v-if="region.name" class="cities-overview__region-header">
            <span class="cities-overview__region-label">{{ region.name }}</span>
          </div>
          <div class="cities-overview__grid">
            <button
              v-for="summary in region.cities"
              :key="`${summary.country.iso3}/${summary.city.id}`"
              class="cities-overview__item"
              @click="emit('city-click', summary.country.iso3, summary.city.id)"
            >
              <span class="cities-overview__city-name">{{ summary.city.name }}</span>
              <span class="cities-overview__stats">
                {{ nDays(summary.visitCount) }}
                <span class="cities-overview__stats-sep">·</span>
                {{ nPlaces(summary.placeCount) }}
                <span class="cities-overview__stats-sep">·</span>
                {{ nTrips(summary.tripCount) }}
              </span>
              <span class="cities-overview__last-visited">
                {{ formatDayShort(summary.lastVisited, currentLanguage) }}
              </span>
            </button>
          </div>
        </div>
      </template>

      <div v-else class="cities-overview__grid">
        <button
          v-for="summary in group.regions[0]?.cities"
          :key="`${summary.country.iso3}/${summary.city.id}`"
          class="cities-overview__item"
          @click="emit('city-click', summary.country.iso3, summary.city.id)"
        >
          <span class="cities-overview__city-name">{{ summary.city.name }}</span>
          <span class="cities-overview__stats">
            {{ nDays(summary.visitCount) }}
            <span class="cities-overview__stats-sep">·</span>
            {{ nPlaces(summary.placeCount) }}
            <span class="cities-overview__stats-sep">·</span>
            {{ nTrips(summary.tripCount) }}
          </span>
          <span class="cities-overview__last-visited">
            {{ formatDayShort(summary.lastVisited, currentLanguage) }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cities-overview {
  margin-top: rem(8);

  &__head {
    margin-bottom: rem(20);
  }

  &__eyebrow {
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $text-secondary;
    font-weight: 600;
    opacity: 0.7;
  }

  &__group {
    & + & {
      margin-top: rem(32);
    }
  }

  &__group-header {
    display: flex;
    align-items: center;
    gap: rem(10);
    margin-bottom: rem(14);

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: $border-color;
    }
  }

  &__group-label {
    font-size: rem(11);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: $text-secondary;
    opacity: 0.65;
    white-space: nowrap;
  }

  &__region {
    & + & {
      margin-top: rem(20);
    }
  }

  &__region-header {
    display: flex;
    align-items: center;
    gap: rem(8);
    margin-bottom: rem(10);

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: $border-color;
      opacity: 0.5;
    }
  }

  &__region-label {
    font-size: rem(10);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: $text-secondary;
    opacity: 0.5;
    white-space: nowrap;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(rem(220), 1fr));
    gap: rem(12);

    @media (max-width: 600px) {
      grid-template-columns: repeat(auto-fill, minmax(rem(160), 1fr));
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: rem(4);
    padding: rem(18) rem(20);
    background: rgb(var(--v-theme-surface));
    border: 1px solid $border-color;
    border-radius: rem(8);
    text-align: left;
    cursor: pointer;
    transition: $transition-fast;

    &:hover {
      border-color: $accent;

      .cities-overview__city-name {
        color: $accent;
      }
    }
  }

  &__city-name {
    font-size: rem(15);
    font-weight: 500;
    color: $text;
    line-height: 1.2;
    transition: $transition-fast;
  }

  &__stats {
    margin-top: rem(8);
    font-size: rem(13);
    font-variant-numeric: tabular-nums;
    color: $text;
    font-weight: 500;
    line-height: 1;
  }

  &__stats-sep {
    color: $text-secondary;
    opacity: 0.5;
    margin: 0 rem(3);
  }

  &__last-visited {
    font-size: rem(10);
    color: $text-secondary;
    opacity: 0.55;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
}
</style>
