<script setup lang="ts">
import type { TravelPlace } from '~/composables/travel';

interface Props {
  place: TravelPlace;
  index: number;
  active: boolean;
}

defineProps<Props>();
defineEmits<{ pick: [index: number] }>();
</script>

<template>
  <v-list-item
    :active
    active-color="primary"
    rounded="lg"
    class="place-item"
    @click="$emit('pick', index)"
  >
    <template #prepend>
      <v-avatar
        :color="active ? 'primary' : undefined"
        :variant="active ? 'flat' : 'outlined'"
        size="22"
        class="place-item__num"
      >
        {{ index + 1 }}
      </v-avatar>
    </template>

    <v-list-item-title class="place-item__name">{{ place.name }}</v-list-item-title>

    <template #append>
      <span class="place-item__count">{{ place.photos }} {{ $t('photos') }}</span>
    </template>
  </v-list-item>
</template>

<style scoped lang="scss">
.place-item {
  border: 1px solid $border-color;
  margin-bottom: rem(4);

  &.v-list-item--active {
    border-color: $accent;
  }

  &__num {
    font-size: rem(11);
    font-weight: 600;
    margin-right: rem(12);
  }

  &__name {
    font-size: rem(14);
  }

  &__count {
    font-size: rem(11);
    color: $text-secondary;
  }
}
</style>
