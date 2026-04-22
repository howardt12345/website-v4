<script setup lang="ts">
import type { TravelTrip } from '~/composables/travel';
import { tripCountryNames, formatTripRange, tripSlug } from '~/composables/travel';

interface Props {
  trips: TravelTrip[];
  activeId: string | null;
}

const props = defineProps<Props>();
defineEmits<{ pick: [id: string] }>();

// Trips alternate between two rows to reduce label overlap.
const TRACK_TOP_PX = 40;
const TRACK_ROW_STRIDE_PX = 46;

const sortedTrips = computed(() =>
  [...props.trips].sort((a, b) => a.start.localeCompare(b.start)),
);

// Spans Jan 1 of the first trip's year through Jan 1 of (last year + 1),
// ensuring every trip has visible whitespace on both sides.
const yearRange = computed(() => {
  const s = sortedTrips.value;
  if (!s.length) return { first: 0, last: 0, years: [] as number[] };
  const first = new Date(s[0]!.start).getUTCFullYear();
  const last = new Date(s[s.length - 1]!.end).getUTCFullYear();
  const years: number[] = [];
  for (let y = first; y <= last + 1; y++) years.push(y);
  return { first, last, years };
});

const trackWidthPx = computed(() =>
  Math.max(900, (yearRange.value.last - yearRange.value.first + 1) * 220),
);

const totalMs = computed(() => {
  const { first, last } = yearRange.value;
  return Math.max(1, Date.UTC(last + 1, 0, 1) - Date.UTC(first, 0, 1));
});

const timelinePct = (iso: string): number =>
  ((new Date(iso).getTime() - Date.UTC(yearRange.value.first, 0, 1)) / totalMs.value) * 100;
</script>

<template>
  <div v-if="trips.length" class="timeline-ribbon">
    <div class="timeline-ribbon__track" :style="{ minWidth: `${trackWidthPx}px` }">
      <div
        v-for="year in yearRange.years"
        :key="year"
        class="timeline-ribbon__year"
        :style="{ left: timelinePct(`${year}-01-01`) + '%' }"
      >
        {{ year }}
      </div>

      <button
        v-for="(trip, i) in sortedTrips"
        :key="tripSlug(trip)"
        class="timeline-ribbon__trip"
        :class="{ 'timeline-ribbon__trip--active': activeId === tripSlug(trip) }"
        :style="{
          left: timelinePct(trip.start) + '%',
          top: `${TRACK_TOP_PX + (i % 2) * TRACK_ROW_STRIDE_PX}px`,
        }"
        @click="$emit('pick', tripSlug(trip))"
      >
        <span class="timeline-ribbon__country">{{ tripCountryNames(trip).join(' · ') }}</span>
        <span class="timeline-ribbon__title">{{ trip.title }}</span>
        <span class="timeline-ribbon__meta">{{ formatTripRange(trip) }}</span>
      </button>
    </div>
  </div>

  <v-card v-else variant="outlined" class="timeline-ribbon__empty" rounded="lg">
    <v-card-text class="text-center text-medium-emphasis">{{ $t('No trips yet.') }}</v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.timeline-ribbon {
  position: relative;
  padding: rem(20) 0 rem(8);
  overflow-x: auto;
  margin-bottom: rem(32);

  &__track {
    position: relative;
    height: rem(160);
    background:
      linear-gradient(to right, $border-color 1px, transparent 1px) 0 50% / 80px 1px no-repeat,
      linear-gradient(to right, transparent 50%, $border-color 50%) 0 50% / 100% 1px repeat-x;
  }

  &__year {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    color: $text-secondary;
    font-size: rem(11);
    font-variant-numeric: tabular-nums;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.6;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: rem(20);
      bottom: rem(-4);
      width: 1px;
      background: $border-color;
    }
  }

  &__trip {
    position: absolute;
    padding: rem(8) rem(12);
    background: rgb(var(--v-theme-surface));
    border: 1px solid $border-color;
    border-radius: rem(10);
    font-size: rem(12);
    cursor: pointer;
    transition: $transition-fast;
    color: $text;
    font: inherit;
    text-align: left;
    min-width: rem(140);
    display: flex;
    flex-direction: column;
    gap: rem(2);

    &:hover {
      border-color: $accent;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    }

    &--active {
      border-color: $accent;
      background: $translucent-accent;
    }
  }

  &__country {
    color: $accent;
    font-size: rem(10);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 600;
  }

  &__title {
    font-weight: 500;
    font-size: rem(13);
    line-height: 1.25;
    color: $text;
  }

  &__meta {
    color: $text-secondary;
    font-size: rem(11);
  }

  &__empty {
    border-style: dashed;
  }
}
</style>
