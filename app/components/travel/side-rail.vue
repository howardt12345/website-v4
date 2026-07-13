<script setup lang="ts">
import type { TravelTrip, TravelDay, TravelView } from '~/types/travel';
import {
  tripSlug,
  tripCountryNames,
  formatTripRange,
  daySpan,
  formatDayShort,
  dayTitle,
  visiblePlaces,
} from '~/composables/travel';
import { usei18n } from '~/store/i18n.store';
import { useTravelStore } from '~/store/travel.store';
import { useMediaQueries } from '~/composables/media-queries';

interface Props {
  view: TravelView;
  trips: TravelTrip[];
  tripDays: TravelDay[];
  activeDayIndex: number | null;
  focusCountryName?: string;
  focusTrip?: TravelTrip;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'pick-trip': [slug: string];
  'pick-day': [idx: number | null];
}>();

const collapsed = defineModel<boolean>('collapsed', { default: false });

const { isNarrow } = useMediaQueries();

const travelStore = useTravelStore();
const { cityById, countryByIso3 } = travelStore;
const { travelPhotosByPlace, tripOverviewProps } = storeToRefs(travelStore);
const i18n = usei18n();
const { currentLanguage } = storeToRefs(i18n);
const { t } = i18n;
const nDays = (n: number) => t('{{n}} days', { n });
const nPhotos = (n: number | undefined) => t('{{n}} photos', { n: n ?? 0 });
const nStops = (n: number) => t('{{n}} stops', { n });
const tripsToName = (name: string) => t('Trips to {{name}}', { name });

const photoCountForTrip = (trip: TravelTrip): number => {
  const tId = tripSlug(trip).split('/').at(-1) ?? tripSlug(trip);
  return Object.values(travelPhotosByPlace.value[tId] ?? {}).reduce((sum, arr) => sum + arr.length, 0);
};

const dayPhotoCountMap = computed<Map<string, number>>(() => {
  const map = new Map<string, number>();
  for (const d of tripOverviewProps.value.days) map.set(d.day.date, d.photos.length);
  return map;
});

const tripTotalPhotoCount = computed<number>(() => {
  let total = 0;
  for (const count of dayPhotoCountMap.value.values()) total += count;
  return total;
});

const railBodyRef = ref<HTMLElement | null>(null);

type TripRailItem =
  | { type: 'year'; key: string; year: string }
  | { type: 'trip'; key: string; trip: TravelTrip };

const tripRailItems = computed((): TripRailItem[] => {
  const sorted = [...props.trips].sort((a, b) => b.start.localeCompare(a.start));
  const byYear = new Map<string, TravelTrip[]>();
  for (const trip of sorted) {
    const year = trip.start.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(trip);
  }
  const items: TripRailItem[] = [];
  for (const [year, trips] of byYear) {
    items.push({ type: 'year', key: `year-${year}`, year });
    for (const trip of trips) items.push({ type: 'trip', key: tripSlug(trip), trip });
  }
  return items;
});

const dayCityLabel = (day: TravelDay): string => dayTitle(day, cityById);

watch(
  () => props.activeDayIndex,
  async () => {
    await nextTick();
    railBodyRef.value
      ?.querySelector<HTMLElement>('.rail-day-item--active, .rail-strip__item--active')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  },
);
</script>

<template>
  <aside class="side-rail" :class="{ 'side-rail--collapsed': collapsed }">

    <template v-if="collapsed">
      <div class="side-rail__collapsed-hit" @click="collapsed = false">
        <button class="side-rail__expand-btn" type="button" :aria-label="$t('Expand timeline')">
          <v-icon size="16">fas fa-chevron-left</v-icon>
        </button>
        <span class="side-rail__collapsed-label">{{ $t('Timeline') }}</span>
      </div>
    </template>

    <template v-else>
      <div class="side-rail__head">
        <span class="side-rail__label">
          <template v-if="view === 'trip'">{{ $t('Day by day') }}</template>
          <template v-else-if="view === 'country' && focusCountryName">
            {{ tripsToName(focusCountryName) }}
          </template>
          <template v-else>{{ $t('Timeline of trips') }}</template>
        </span>
        <button
          class="side-rail__collapse-btn"
          type="button"
          :aria-label="$t('Collapse timeline')"
          @click="collapsed = true"
        >
          <v-icon size="16">fas fa-chevron-right</v-icon>
        </button>
      </div>

      <div ref="railBodyRef" class="side-rail__body">

        <div v-if="isNarrow" class="rail-strip">
          <template v-if="view === 'trip' && focusTrip">
            <button
              type="button"
              class="rail-strip__item"
              :class="{ 'rail-strip__item--active': activeDayIndex === null }"
              :aria-current="activeDayIndex === null ? 'true' : undefined"
              @click="emit('pick-day', null)"
            >
              <span class="rail-strip__line1">{{ $t('Overview') }}</span>
              <span class="rail-strip__line2">{{ $t('Full trip') }}</span>
            </button>
            <button
              v-for="(day, i) in tripDays"
              :key="day.date"
              type="button"
              class="rail-strip__item"
              :class="{ 'rail-strip__item--active': i === activeDayIndex }"
              :aria-current="i === activeDayIndex ? 'true' : undefined"
              @click="emit('pick-day', i)"
            >
              <span class="rail-strip__line1">{{ formatDayShort(day.date, currentLanguage) }}</span>
              <span class="rail-strip__line2">{{ dayCityLabel(day) }}</span>
            </button>
          </template>

          <template v-else>
            <template v-for="item in tripRailItems" :key="item.key">
              <span v-if="item.type === 'year'" class="rail-strip__year">{{ item.year }}</span>
              <button
                v-else
                type="button"
                class="rail-strip__item"
                @click="emit('pick-trip', tripSlug(item.trip))"
              >
                <span class="rail-strip__line1">{{ tripCountryNames(item.trip, countryByIso3).join(' · ') }}</span>
                <span class="rail-strip__line2">{{ item.trip.title }}</span>
              </button>
            </template>
          </template>
        </div>

        <template v-else>
          <template v-if="view === 'trip' && focusTrip">
            <v-timeline density="compact" side="end" align="start" class="rail-timeline">
              <v-timeline-item
                :dot-color="activeDayIndex === null ? 'primary' : undefined"
                size="x-small"
                class="rail-day-item"
                :class="{ 'rail-day-item--active': activeDayIndex === null }"
              >
                <button
                  type="button"
                  class="rail-item-btn"
                  :aria-current="activeDayIndex === null ? 'true' : undefined"
                  @click="emit('pick-day', null)"
                >
                  <div class="rail-day">
                    <span class="rail-day__date">{{ $t('Overview') }}</span>
                    <span class="rail-day__city">{{ $t('Full trip') }}</span>
                    <span class="rail-day__meta">
                      {{ nDays(tripDays.length) }}
                      <template v-if="tripTotalPhotoCount"> · {{ nPhotos(tripTotalPhotoCount) }}</template>
                    </span>
                  </div>
                </button>
              </v-timeline-item>

              <v-timeline-item
                v-for="(day, i) in tripDays"
                :key="day.date"
                :dot-color="i === activeDayIndex ? 'primary' : undefined"
                size="x-small"
                class="rail-day-item"
                :class="{ 'rail-day-item--active': i === activeDayIndex }"
              >
                <button
                  type="button"
                  class="rail-item-btn"
                  :aria-current="i === activeDayIndex ? 'true' : undefined"
                  @click="emit('pick-day', i)"
                >
                  <div class="rail-day">
                    <span class="rail-day__date">{{ formatDayShort(day.date, currentLanguage) }}</span>
                    <span class="rail-day__city">{{ dayCityLabel(day) }}</span>
                    <span class="rail-day__meta">
                      {{ nStops(visiblePlaces(day).length) }}
                      <template v-if="dayPhotoCountMap.get(day.date)"> · {{ nPhotos(dayPhotoCountMap.get(day.date)) }}</template>
                    </span>
                  </div>
                </button>
              </v-timeline-item>
            </v-timeline>
          </template>

          <template v-else>
            <v-timeline density="compact" side="end" align="start" class="rail-timeline">
              <template v-for="item in tripRailItems" :key="item.key">
                <v-timeline-item v-if="item.type === 'year'" hide-dot class="rail-year-item">
                  <span class="rail-year">{{ item.year }}</span>
                </v-timeline-item>
                <v-timeline-item
                  v-else
                  dot-color="accent"
                  size="x-small"
                  class="rail-trip-item"
                >
                  <button
                    type="button"
                    class="rail-item-btn"
                    @click="emit('pick-trip', tripSlug(item.trip))"
                  >
                    <div class="rail-trip">
                      <span class="rail-trip__countries">
                        {{ tripCountryNames(item.trip, countryByIso3).join(' · ') }}
                      </span>
                      <span class="rail-trip__title">{{ item.trip.title }}</span>
                      <span class="rail-trip__meta">
                        {{ formatTripRange(item.trip, currentLanguage) }} · {{ nDays(daySpan(item.trip)) }}
                        <template v-if="photoCountForTrip(item.trip)"> · {{ nPhotos(photoCountForTrip(item.trip)) }}</template>
                      </span>
                    </div>
                  </button>
                </v-timeline-item>
              </template>
            </v-timeline>
          </template>
        </template>

      </div>
    </template>
  </aside>
</template>

<style scoped lang="scss">
.side-rail {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid $border-color;
  border-radius: rem(8);
  background: rgb(var(--v-theme-surface));
  overflow: hidden;

  &--collapsed {
    align-items: center;
    padding-top: rem(12);
  }

  @media (max-width: 960px) {
    height: auto;
  }
}

.side-rail__collapsed-hit {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
  cursor: pointer;
}

.side-rail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: rem(12) rem(14);
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;
}

.side-rail__label {
  font-size: rem(11);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: $text-secondary;
  opacity: 0.7;
}

.side-rail__collapse-btn,
.side-rail__expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: $text-secondary;
  padding: rem(4);
  border-radius: rem(4);
  transition: $transition-fast;
  line-height: 1;

  &:hover {
    color: $text;
    background: rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &:focus-visible {
    outline: 2px solid $accent;
    outline-offset: 2px;
  }
}

.side-rail__collapse-btn {
  @media (max-width: 960px) {
    display: none;
  }
}

.side-rail__expand-btn {
  width: rem(28);
  height: rem(28);
}

.side-rail__collapsed-label {
  writing-mode: vertical-lr;
  font-size: rem(12);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: $text-secondary;
  opacity: 0.5;
  margin-top: rem(12);
  user-select: none;
}

.side-rail__body {
  flex: 1;
  overflow-y: auto;
  padding: rem(4) rem(6) rem(20);

  @media (max-width: 960px) {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
    padding: rem(10);
  }
}

.rail-item-btn {
  display: block;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid $accent;
    outline-offset: 2px;
    border-radius: rem(4);
  }
}

.rail-timeline {
  height: auto;
  row-gap: rem(6);

  :deep(.v-timeline-item__body) {
    padding-inline-start: rem(8) !important;
  }

  :deep(.v-timeline-item:first-child .v-timeline-item__body),
  :deep(.v-timeline-item:first-child .v-timeline-divider) {
    padding-block-start: rem(8) !important;
  }

  :deep(.v-timeline-item:last-child .v-timeline-item__body),
  :deep(.v-timeline-item:last-child .v-timeline-divider) {
    padding-block-end: rem(8) !important;
  }
}

.rail-year-item {
  pointer-events: none;
}

.rail-year {
  display: block;
  font-size: rem(11);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: $text-secondary;
  padding: rem(4) 0 rem(2);
  opacity: 0.55;
}

.rail-trip-item {
  &:hover .rail-trip__title {
    color: $accent;
  }
}

.rail-trip {
  display: flex;
  flex-direction: column;
  gap: rem(2);
  padding-bottom: rem(4);

  &__countries {
    font-size: rem(10);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: $accent;
  }

  &__title {
    font-size: rem(13);
    font-weight: 500;
    color: $text;
    line-height: 1.3;
    transition: $transition-fast;
  }

  &__meta {
    font-size: rem(11);
    color: $text-secondary;
    opacity: 0.75;
  }
}

.rail-day-item {
  &--active .rail-day__date {
    color: $accent;
    opacity: 1;
  }

  &:hover .rail-day__city {
    color: $accent;
  }
}

.rail-day {
  display: flex;
  flex-direction: column;
  gap: rem(1);
  padding-bottom: rem(4);

  &__date {
    font-size: rem(10);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $text-secondary;
    opacity: 0.6;
    transition: $transition-fast;
  }

  &__city {
    font-size: rem(13);
    font-weight: 500;
    color: $text;
    line-height: 1.3;
    transition: $transition-fast;
  }

  &__meta {
    font-size: rem(11);
    color: $text-secondary;
    opacity: 0.65;
  }
}

.rail-strip {
  display: flex;
  align-items: stretch;
  gap: rem(8);
  scroll-snap-type: x proximity;
}

.rail-strip__year {
  flex-shrink: 0;
  align-self: center;
  font-size: rem(11);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: $text-secondary;
  opacity: 0.55;
  padding: 0 rem(4);
}

.rail-strip__item {
  flex-shrink: 0;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  gap: rem(2);
  min-width: rem(120);
  max-width: rem(160);
  padding: rem(8) rem(12);
  background: rgb(var(--v-theme-surface));
  border: 1px solid $border-color;
  border-radius: rem(8);
  text-align: left;
  cursor: pointer;
  transition: $transition-fast;

  &:focus-visible {
    outline: 2px solid $accent;
    outline-offset: 2px;
  }

  &--active {
    border-color: $accent;
  }
}

.rail-strip__line1 {
  font-size: rem(10);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: $text-secondary;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .rail-strip__item--active & {
    color: $accent;
    opacity: 1;
  }
}

.rail-strip__line2 {
  font-size: rem(12);
  font-weight: 500;
  color: $text;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
