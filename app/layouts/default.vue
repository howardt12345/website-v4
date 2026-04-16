<script setup lang="ts">
import { useMediaQueries } from '~/composables/media-queries';

const { isTablet } = useMediaQueries();

const drawerOpen = ref(false);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const links = useNavLinks();
</script>

<template>
  <div>
    <v-navigation-drawer v-if="isTablet" v-model="drawerOpen" temporary>
      <v-btn
        nuxt
        to="/"
        class="drawer-brand"
        size="x-large"
        variant="plain"
        :ripple="false"
        >Howard Tseng</v-btn
      >
      <v-divider />
      <v-list class="nav-drawer-content">
        <v-list-item
          v-for="link in links"
          :key="link.name"
          class="nav-drawer-content__item"
          nuxt
          :to="link.path"
          :title="$t(link.name)"
          :ripple="false"
        />
      </v-list>
    </v-navigation-drawer>

    <header class="top-nav">
      <v-btn
        v-if="isTablet"
        :icon="drawerOpen ? 'fas fa-xmark' : 'fas fa-bars'"
        variant="plain"
        :ripple="false"
        class="top-nav__menu-btn"
        @click="toggleDrawer"
      />
      <v-btn
        nuxt
        to="/"
        class="top-nav__brand"
        size="x-large"
        variant="plain"
        :ripple="false"
        >Howard Tseng</v-btn
      >
      <div class="top-nav__spacer" />
      <NavLinks v-if="!isTablet" />
      <CommonThemeToggle />
    </header>

    <slot />
    <NavFooter />
  </div>
</template>

<style scoped lang="scss">
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: rem(8);
  padding: rem(8) rem(24);
  min-height: $nav-height;
  background: $background-glass;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid $border-color;
  transition: background $transition-fast;

  &__brand {
    letter-spacing: 0.01em;
    font-weight: 400;
  }

  &__spacer {
    flex: 1;
  }
}

.nav-drawer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 99%;
  margin-top: -52px;
  padding: 0;

  &__item {
    width: 100%;
    justify-content: center;
    color: $text-secondary;
  }
}

.drawer-brand {
  z-index: 1;
}
</style>
