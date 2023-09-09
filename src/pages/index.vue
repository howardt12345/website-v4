<script setup lang="ts">
import { useMounted } from '@vueuse/core';

const isMounted = useMounted();
definePageMeta({
  layout: false,
});
</script>

<template>
  <NuxtLayout name="index">
    <main v-if="isMounted">
      <HomeTitle />
      <NavLinks :animate="true" :delay="1000"/>
      <CommonThemeToggle />
    </main>
  </NuxtLayout>
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
