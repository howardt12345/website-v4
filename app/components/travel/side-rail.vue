<script setup lang="ts">
import type { TravelTrip, TravelDay } from '~/composables/travel';
import {
  tripSlug,
  tripCountryNames,
  formatTripRange,
  daySpan,
  formatDayShort,
  dayUniqueCities,
} from '~/composables/travel';
import { useTravelStore } from '~/store/travel.store';

interface Props {
  view: 'world' | 'country' | 'trip';
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

const { cityById } = useTravelStore();

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

const dayCityLabel = (day: TravelDay): string =>
  dayUniqueCities(day)
    .map((loc) => cityById(loc.country, loc.city)?.name ?? loc.city)
    .join(' → ');

watch(
  () => props.activeDayIndex,
  async () => {
    await nextTick();
    railBodyRef.value
      ?.querySelector<HTMLElement>('.rail-day-item--active')
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
);
</script>

<template>
  <aside class="side-rail" :class="{ 'side-rail--collapsed': collapsed }">

    <template v-if="collapsed">
      <button
        class="side-rail__expand-btn"
        @click="collapsed = false"
        :aria-label="$t('Timeline of trips')"
      >
        <v-icon size="16">fas fa-chevron-left</v-icon>
      </button>
      <span class="side-rail__collapsed-label">{{ $t('Timeline') }}</span>
    </template>

    <template v-else>
      <div class="side-rail__head">
        <span class="side-rail__label">
          <template v-if="view === 'trip'">{{ $t('Day by day') }}</template>
          <template v-else-if="view === 'country' && focusCountryName">
            {{ $t('Trips to') }} {{ focusCountryName }}
          </template>
          <template v-else>{{ $t('Timeline of trips') }}</template>
        </span>
        <button
          class="side-rail__collapse-btn"
          @click="collapsed = true"
          :aria-label="$t('Close')"
        >
          <v-icon size="16">fas fa-chevron-right</v-icon>
        </button>
      </div>

      <div ref="railBodyRef" class="side-rail__body">

        <template v-if="view === 'trip' && focusTrip">
          <v-timeline density="compact" side="end" align="start" class="rail-timeline">
            <v-timeline-item
              :dot-color="activeDayIndex === null ? 'primary' : undefined"
              size="x-small"
              class="rail-day-item"
              :class="{ 'rail-day-item--active': activeDayIndex === null }"
              @click="emit('pick-day', null)"
            >
              <div class="rail-day">
                <span class="rail-day__date">{{ $t('Overview') }}</span>
                <span class="rail-day__city">{{ $t('Full trip') }}</span>
                <span class="rail-day__meta">
                  {{ tripDays.length }} {{ $t('days') }}
                </span>
              </div>
            </v-timeline-item>

            <v-timeline-item
              v-for="(day, i) in tripDays"
              :key="day.date"
              :dot-color="i === activeDayIndex ? 'primary' : undefined"
              size="x-small"
              class="rail-day-item"
              :class="{ 'rail-day-item--active': i === activeDayIndex }"
              @click="emit('pick-day', i)"
            >
              <div class="rail-day">
                <span class="rail-day__date">{{ formatDayShort(day.date) }}</span>
                <span class="rail-day__city">{{ dayCityLabel(day) }}</span>
                <span class="rail-day__meta">
                  {{ day.places.length }} {{ $t('stops') }}
                </span>
              </div>
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
                @click="emit('pick-trip', tripSlug(item.trip))"
              >
                <div class="rail-trip">
                  <span class="rail-trip__countries">
                    {{ tripCountryNames(item.trip).join(' · ') }}
                  </span>
                  <span class="rail-trip__title">{{ item.trip.title }}</span>
                  <span class="rail-trip__meta">
                    {{ formatTripRange(item.trip) }} · {{ daySpan(item.trip) }} {{ $t('days') }}
                  </span>
                </div>
              </v-timeline-item>
            </template>
          </v-timeline>
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
    cursor: pointer;
  }

  @media (max-width: 960px) {
    height: auto;
    max-height: rem(400);
  }
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
  cursor: pointer;

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
  cursor: pointer;

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
</style>
