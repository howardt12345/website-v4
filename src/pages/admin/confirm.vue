<script setup lang="ts">
import { useAdminStore } from '@/store/admin.store';

const { hasUser } = storeToRefs(useAdminStore());

watch(
  hasUser,
  (newValue) => {
    if (newValue) {
      return navigateTo('/admin');
    }
  },
  { immediate: true },
);
</script>

<template>
  <div>Waiting for login...</div>
</template>

<style scoped lang="scss"></style>
