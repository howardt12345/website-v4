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

interface DateGroup {
  date: string;
  label: string;
  entries: TravelTimelineEntry[];
}

const dateGroups = computed<DateGroup[]>(() => {
  const groups: DateGroup[] = [];
  let current: DateGroup | null = null;

  for (const item of props.places) {
    if (!current || current.date !== item.dayDate) {
      current = {
        date: item.dayDate,
        label: formatDayLabel(item.dayDate, currentLanguage.value),
        entries: [],
      };
      groups.push(current);
    }
    current.entries.push({
      key: `${item.dayDate}-${item.place.id ?? item.place.name}`,
      eyebrow: item.tripTitle,
      title: item.place.name,
      photos: item.photos.map((p) => ({
        url: p.url,
        alt: p.alt ?? p.title ?? item.place.name,
        title: p.title,
        caption: p.caption,
        tags: p.tags,
      })),
    });
  }

  return groups;
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

    <template v-if="dateGroups.length">
      <div v-for="group in dateGroups" :key="group.date" class="city-view__group">
        <div class="city-view__date-header">
          <span class="city-view__date-label">{{ group.label }}</span>
        </div>
        <TravelTimeline :entries="group.entries" />
      </div>
    </template>

    <p v-else class="city-view__empty">{{ $t('No places recorded for this city yet.') }}</p>
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

  &__group + &__group {
    margin-top: rem(32);
  }

  &__date-header {
    display: flex;
    align-items: center;
    gap: rem(10);
    margin-bottom: rem(16);

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: $border-color;
    }
  }

  &__date-label {
    font-size: rem(11);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: $text-secondary;
    opacity: 0.65;
    white-space: nowrap;
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
</style>
