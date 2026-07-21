<script setup lang="ts">
import { useMounted } from '@vueuse/core';
import { useMediaQueries } from '~/composables/media-queries';
import { readStorage, writeStorage } from '~/utils/storage';

const NAV_LINKS_DELAY = 1250;
const THEME_TOGGLE_DELAY = 1700;
const HERO_ENTER_MS = 500;
const HERO_INTRO_KEY = 'heroIntroPlayed';

const isMounted = useMounted();
const { isMobile, isTablet } = useMediaQueries();
const route = useRoute();

const heroIntroPlayed = readStorage('session', HERO_INTRO_KEY) === '1';
const heroAnimate = !heroIntroPlayed;
const navLinksDelay = heroIntroPlayed ? 0 : NAV_LINKS_DELAY;
const themeToggleDelay = heroIntroPlayed ? 0 : THEME_TOGGLE_DELAY;
const heroEnterMs = heroIntroPlayed ? 0 : HERO_ENTER_MS;

onMounted(() => {
  writeStorage('session', HERO_INTRO_KEY, '1');

  // Fallback for progressively-mounted sections; skip if the router/native scroll already handled it.
  if (!route.hash) return;
  let userScrolled = false;
  const flagScroll = () => (userScrolled = true);
  window.addEventListener('wheel', flagScroll, { once: true, passive: true });
  window.addEventListener('touchmove', flagScroll, { once: true, passive: true });
  nextTick(() => {
    const target = document.querySelector(route.hash);
    if (target && !userScrolled && window.scrollY === 0) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    window.removeEventListener('wheel', flagScroll);
    window.removeEventListener('touchmove', flagScroll);
  });
});
</script>

<template>
  <main>
    <section id="home" class="home-section">
      <div v-if="isMounted" class="home-section__content">
        <HomeTitle :is-mobile="isMobile" :is-tablet="isTablet" />
        <NavLinks :animate="heroAnimate" :delay="navLinksDelay" :icon-only="isMobile" />
        <div
          v-motion
          class="theme-toggle"
          :initial="{ opacity: 0, y: -10 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { duration: heroEnterMs, type: 'keyframes', ease: 'easeOut' },
          }"
          :delay="themeToggleDelay"
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
