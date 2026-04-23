<script setup lang="ts">
import type { TravelDay } from '~/composables/travel';
import { formatDayShort, dayUniqueCities } from '~/composables/travel';
import { useTravelStore } from '~/store/travel.store';

interface Props {
  days: TravelDay[];
  activeIndex: number | null;
  multiCountry: boolean;
}

const props = defineProps<Props>();
defineEmits<{ pick: [index: number | null] }>();

const { cityById, countryByIso3 } = useTravelStore();

const dayCityLabel = (day: TravelDay): string =>
  dayUniqueCities(day)
    .map((loc) => cityById(loc.country, loc.city)?.name ?? loc.city)
    .join(' → ');

const isCountryTransition = (index: number): boolean =>
  index === 0 || props.days[index - 1]?.country !== props.days[index]!.country;
</script>

<template>
  <v-slide-group :model-value="activeIndex" class="day-ribbon" mandatory>
    <v-slide-group-item :value="null" v-slot="{ isSelected }">
      <v-card
        :variant="isSelected ? 'tonal' : 'outlined'"
        :color="isSelected ? 'primary' : undefined"
        class="day-card"
        rounded="lg"
        @click="$emit('pick', null)"
      >
        <v-card-text class="day-card__body">
          <span class="day-card__date">{{ $t('Overview') }}</span>
          <span class="day-card__city">{{ $t('Full trip') }}</span>
          <span class="day-card__meta">{{ days.length }} {{ $t('days') }}</span>
        </v-card-text>
      </v-card>
    </v-slide-group-item>

    <v-slide-group-item
      v-for="(day, i) in days"
      :key="day.date"
      :value="i"
      v-slot="{ isSelected }"
    >
      <v-card
        :variant="isSelected ? 'tonal' : 'outlined'"
        :color="isSelected ? 'primary' : undefined"
        class="day-card"
        rounded="lg"
        @click="$emit('pick', i)"
      >
        <v-card-text class="day-card__body">
          <span class="day-card__date">{{ formatDayShort(day.date) }}</span>
          <span class="day-card__city">{{ dayCityLabel(day) }}</span>
          <span class="day-card__meta">
            <span v-if="multiCountry && isCountryTransition(i)" class="day-card__country">
              {{ countryByIso3(day.country)?.name }} ·
            </span>
            {{ day.places.length }} {{ $t('stops') }}
          </span>
        </v-card-text>
      </v-card>
    </v-slide-group-item>
  </v-slide-group>
</template>

<style scoped lang="scss">
.day-ribbon {
  padding: rem(12) 0;
}

.day-card {
  flex: 0 0 auto;
  cursor: pointer;
  min-width: rem(140);
  margin-right: rem(8);

  &__body {
    display: flex;
    flex-direction: column;
    gap: rem(2);
    padding: rem(10) rem(14);
  }

  &__date {
    font-size: rem(11);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $text-secondary;
    font-weight: 600;
    opacity: 0.7;
  }

  &__city {
    font-size: rem(16);
    font-weight: 500;
    color: $text;
  }

  &__meta {
    color: $text-secondary;
    font-size: rem(11);
  }

  &__country {
    color: $accent;
    font-weight: 600;
  }
}
</style>
