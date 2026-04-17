<script setup lang="ts">
import { useMounted } from '@vueuse/core';
import { useMediaQueries } from '~/composables/media-queries';

const NAV_LINKS_DELAY = 1250;

const isMounted = useMounted();
const { isMobile, isTablet } = useMediaQueries();
const route = useRoute();

onMounted(() => {
  if (!route.hash) return;
  setTimeout(() => {
    document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth' });
  }, NAV_LINKS_DELAY);
});
</script>

<template>
  <main>
    <section id="home" class="home-section">
      <div v-if="isMounted" class="home-section__content">
        <HomeTitle :is-mobile="isMobile" :is-tablet="isTablet" />
        <NavLinks :animate="true" :delay="NAV_LINKS_DELAY" :icon-only="isMobile" />
        <div
          v-motion
          class="theme-toggle"
          :initial="{ opacity: 0, y: -10 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { duration: 500, type: 'keyframes', ease: 'easeOut' },
          }"
          :delay="1700"
        >
          <CommonThemeToggle />
        </div>
      </div>
    </section>

    <div class="content-container">
      <section id="about">
        <HomeAbout />
      </section>

      <section id="experience">
        <HomeExperience />
      </section>

      <section id="projects">
        <HomeProjects />
      </section>

      <section id="contact">
        <HomeContact />
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
.home-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: calc(100vh - $nav-height);

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.theme-toggle {
  padding-top: rem(16);
}
</style>
