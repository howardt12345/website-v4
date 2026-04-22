<script setup lang="ts">
import type { TravelTrip } from '~/composables/travel';
import { tripCountryNames, daySpan, formatTripRange } from '~/composables/travel';

interface Props {
  trip: TravelTrip;
}

defineProps<Props>();
</script>

<template>
  <div class="trip-header">
    <div class="trip-header__eyebrow">
      {{ tripCountryNames(trip).join(' → ') }}
      · {{ daySpan(trip) }} {{ $t('days') }}
      · {{ formatTripRange(trip) }}
    </div>
    <h2 class="trip-header__title">{{ trip.title }}</h2>
    <p class="trip-header__excerpt">{{ trip.excerpt }}</p>
  </div>
</template>

<style scoped lang="scss">
.trip-header {
  padding-top: rem(24);
  border-top: 1px solid $border-color;

  &__eyebrow {
    display: flex;
    align-items: center;
    gap: rem(10);
    font-size: rem(11);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: $accent;
    margin-bottom: rem(12);

    &::before {
      content: '';
      display: inline-block;
      width: rem(22);
      height: 1px;
      background: $accent;
      flex-shrink: 0;
    }
  }

  &__title {
    font-size: clamp(#{rem(28)}, 3.2vw, #{rem(40)});
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-weight: 500;
    color: $text;
    margin: 0 0 rem(10);
  }

  &__excerpt {
    color: $text-secondary;
    font-size: rem(15);
    line-height: 1.55;
    max-width: 68ch;
    margin: 0;
  }
}
</style>
