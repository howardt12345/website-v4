<script setup lang="ts">
import { useMediaQueries } from '@/composables/media-queries';

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
        class="title-button"
        size="x-large"
        variant="plain"
        :ripple="false"
        >Howard Tseng</v-btn
      >
      <v-divider></v-divider>
      <v-list class="nav-drawer-content">
        <v-list-item
          v-for="link in links"
          :key="link.name"
          class="nav-drawer-content__item"
          nuxt
          :to="link.path"
          :title="$t(link.name)"
          :ripple="false"
        >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer class="app-bar" elevation="0" color="background">
      <v-app-bar-nav-icon
        v-if="isTablet"
        v-model="drawerOpen"
        @click="toggleDrawer"
      ></v-app-bar-nav-icon>
      <v-app-bar-title>
        <v-btn
          nuxt
          to="/"
          class="title-button"
          size="x-large"
          variant="plain"
          :ripple="false"
          >Howard Tseng</v-btn
        >
      </v-app-bar-title>
      <NavLinks v-if="!isTablet" />
      <CommonThemeToggle />
    </v-footer>
    <div class="content-container">
      <slot />
    </div>
    <NavFooter />
  </div>
</template>

<style scoped lang="scss">
.app-bar {
  padding: rem(12);
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

.content-container {
  max-width: rem(1200);
  width: 80vw;
  margin: 0 auto;
}

.title-button {
  z-index: 1;
}
</style>
