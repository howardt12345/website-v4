<script setup lang="ts">
import type { TravelTrip } from '~/composables/travel';
import { tripCountryNames, formatTripRange, daySpan, tripSlug } from '~/composables/travel';

interface Props {
  trips: TravelTrip[];
  activeId: string | null;
}

const props = defineProps<Props>();
defineEmits<{ pick: [id: string] }>();

const groupedByYear = computed((): Record<string, TravelTrip[]> => {
  const sorted = [...props.trips].sort((a, b) => b.start.localeCompare(a.start));
  return sorted.reduce<Record<string, TravelTrip[]>>((acc, trip) => {
    const year = trip.start.slice(0, 4);
    (acc[year] ??= []).push(trip);
    return acc;
  }, {});
});
</script>

<template>
  <div v-if="trips.length" class="timeline-vert">
    <template v-for="(yearTrips, year) in groupedByYear" :key="year">
      <div class="timeline-vert__year">{{ year }}</div>

      <v-card
        v-for="trip in yearTrips"
        :key="tripSlug(trip)"
        :variant="activeId === tripSlug(trip) ? 'tonal' : 'outlined'"
        :color="activeId === tripSlug(trip) ? 'primary' : undefined"
        class="timeline-vert__trip"
        rounded="lg"
        @click="$emit('pick', tripSlug(trip))"
      >
        <v-card-text class="timeline-vert__body">
          <span class="timeline-vert__title">{{ trip.title }}</span>
          <span class="timeline-vert__excerpt">{{ trip.excerpt }}</span>
          <div class="timeline-vert__meta">
            <span>{{ tripCountryNames(trip).join(' · ') }}</span>
            <span>{{ formatTripRange(trip) }}</span>
            <span>{{ daySpan(trip) }} {{ $t('days') }}</span>
          </div>
        </v-card-text>
      </v-card>
    </template>
  </div>

  <v-card v-else variant="outlined" class="timeline-vert__empty" rounded="lg">
    <v-card-text class="text-center text-medium-emphasis">{{ $t('No trips yet.') }}</v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.timeline-vert {
  display: flex;
  flex-direction: column;
  gap: rem(8);

  &__year {
    font-size: rem(22);
    font-weight: 500;
    color: $text;
    margin: rem(18) 0 rem(4);
    padding-top: rem(12);
    border-top: 1px solid $border-color;
    letter-spacing: -0.01em;

    &:first-child {
      border-top: 0;
      padding-top: 0;
      margin-top: 0;
    }
  }

  &__trip {
    cursor: pointer;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: rem(4);
    padding: rem(12) rem(14);
  }

  &__title {
    font-weight: 500;
    font-size: rem(14);
    color: $text;
  }

  &__excerpt {
    color: $text-secondary;
    font-size: rem(13);
    line-height: 1.5;
  }

  &__meta {
    display: flex;
    color: $text-secondary;
    font-size: rem(11.5);
    opacity: 0.8;

    > span::before {
      content: ' · ';
    }

    > span:first-child::before {
      content: '';
    }
  }

  &__empty {
    border-style: dashed;
  }
}
</style>
