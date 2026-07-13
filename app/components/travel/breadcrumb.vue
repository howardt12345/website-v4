<script setup lang="ts">
import type { TravelCountry, TravelTrip } from '~/types/travel';
import { usei18n } from '~/store/i18n.store';

interface Props {
  country?: TravelCountry;
  trip?: TravelTrip;
  cityName?: string;
  tripCountries?: { iso3: string; name: string }[];
}

interface Emits {
  (e: 'nav-world'): void;
  (e: 'nav-country', iso3: string): void;
}

interface BreadcrumbItem {
  title: string;
  disabled: boolean;
  onClick?: () => void;
  countries?: { iso3: string; name: string }[];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = usei18n();

const tripCountryCrumbs = computed((): BreadcrumbItem[] => {
  const countries = props.tripCountries;
  if (!props.trip || props.country || !countries?.length) return [];
  if (countries.length === 1) {
    const only = countries[0]!;
    return [{ title: only.name, disabled: false, onClick: () => emit('nav-country', only.iso3) }];
  }
  return [{ title: '', disabled: false, countries }];
});

const breadcrumbItems = computed((): BreadcrumbItem[] => [
  {
    title: t('All trips'),
    disabled: !props.country && !props.trip,
    onClick: () => emit('nav-world'),
  },
  ...(props.country
    ? [{
        title: props.country.name,
        disabled: !props.trip && !props.cityName,
        onClick: () => emit('nav-country', props.country!.iso3),
      }]
    : []),
  ...tripCountryCrumbs.value,
  ...(props.cityName && !props.trip
    ? [{ title: props.cityName, disabled: true }]
    : []),
  ...(props.trip
    ? [{ title: props.trip.title, disabled: true }]
    : []),
]);
</script>

<template>
  <v-breadcrumbs :items="breadcrumbItems" class="travel-breadcrumbs" density="compact">
    <template #item="{ item: rawItem }">
      <span
        v-if="(rawItem as BreadcrumbItem).countries"
        class="travel-breadcrumbs__countries"
      >
        <template v-for="(c, i) in (rawItem as BreadcrumbItem).countries" :key="c.iso3">
          <span v-if="i > 0" class="travel-breadcrumbs__country-sep"> · </span>
          <button
            type="button"
            class="travel-breadcrumbs__item travel-breadcrumbs__country"
            @click="emit('nav-country', c.iso3)"
          >
            {{ c.name }}
          </button>
        </template>
      </span>
      <v-breadcrumbs-item
        v-else
        :disabled="(rawItem as BreadcrumbItem).disabled"
        class="travel-breadcrumbs__item"
        @click="(rawItem as BreadcrumbItem).onClick?.()"
      >
        {{ (rawItem as BreadcrumbItem).title }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<style scoped lang="scss">
.travel-breadcrumbs {
  padding: 0;
  margin-bottom: rem(16);

  &__item {
    font-size: rem(13);
    letter-spacing: normal;

    &:not(.v-breadcrumbs-item--disabled) {
      cursor: pointer;
      color: $text-secondary;

      &:hover {
        color: $text;
      }
    }

    &.v-breadcrumbs-item--disabled {
      color: $text;
      opacity: 1;
    }
  }

  &__countries {
    display: inline-flex;
    align-items: center;
  }

  &__country {
    background: none;
    border: none;
    padding: 0;
    font-family: inherit;
    font-weight: inherit;
    line-height: inherit;
    vertical-align: baseline;

    &:focus-visible {
      outline: 2px solid $accent;
      outline-offset: 2px;
    }
  }

  &__country-sep {
    color: $text-secondary;
    opacity: 0.5;
    margin: 0 4px;
  }
}
</style>
