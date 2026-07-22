<script setup lang="ts">
defineProps<{ message?: string }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="retry-panel">
    <p class="retry-panel__msg">{{ message ?? $t('Could not load content.') }}</p>
    <v-btn variant="outlined" size="small" @click="$emit('retry')">
      {{ $t('Try again') }}
    </v-btn>
  </div>
</template>

<style scoped lang="scss">
.retry-panel {
  padding: rem(60) rem(24);
  text-align: center;
  border: 1px dashed $border-color;
  border-radius: rem(14);
  color: $text-secondary;

  &__msg {
    margin: 0 0 rem(14);
    font-size: rem(15);
  }
}
</style>
