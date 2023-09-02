<script setup lang="ts">
import { useMounted } from '@vueuse/core';

const isMounted = useMounted();
</script>

<template>
  <main v-if="isMounted">
    <HomeTitle />
    <CommonThemeToggle />
  </main>
</template>

<style scoped lang="scss">
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
}
</style>
