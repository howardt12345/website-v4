<script setup lang="ts">
import type { TravelCountry, TravelTrip } from '~/types/travel';
import { usei18n } from '~/store/i18n.store';

interface Props {
  country?: TravelCountry;
  trip?: TravelTrip;
}

interface Emits {
  (e: 'navWorld'): void;
  (e: 'navCountry', iso3: string): void;
}

interface BreadcrumbItem {
  title: string;
  disabled: boolean;
  onClick?: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = usei18n();

const breadcrumbItems = computed((): BreadcrumbItem[] => [
  {
    title: t('All trips'),
    disabled: !props.country && !props.trip,
    onClick: () => emit('navWorld'),
  },
  ...(props.country
    ? [{
        title: props.country.name,
        disabled: !props.trip,
        onClick: () => emit('navCountry', props.country!.iso3),
      }]
    : []),
  ...(props.trip
    ? [{ title: props.trip.title, disabled: true }]
    : []),
]);
</script>

<template>
  <v-breadcrumbs :items="breadcrumbItems" class="travel-breadcrumbs" density="compact">
    <template #item="{ item: rawItem }">
      <v-breadcrumbs-item
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
}
</style>
