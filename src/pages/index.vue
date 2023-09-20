<script setup lang="ts">
import { useMounted } from '@vueuse/core';
import { useMediaQueries } from '@/composables/media-queries';

const isMounted = useMounted();
definePageMeta({
  layout: false,
});

const { isMobile, isTablet } = useMediaQueries();
</script>

<template>
  <NuxtLayout name="index">
    <main v-if="isMounted">
      <HomeTitle :is-mobile="isMobile" :is-tablet="isTablet" />
      <NavLinks :animate="true" :delay="1000" :is-mobile="isMobile" />
      <div
        v-motion
        class="theme-toggle"
        :initial="{ opacity: 0, y: -10 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            duration: 500,
            type: 'keyframes',
            ease: 'easeOut',
          },
        }"
        :delay="1700"
      >
        <CommonThemeToggle />
      </div>
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

.theme-toggle {
  padding-top: rem(16);
}
</style>
