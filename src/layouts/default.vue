<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';

const isMobile = useMediaQuery('(max-width: 600px)');

const drawerOpen = ref(false);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const links = useNavLinks();
</script>

<template>
  <div>
    <v-navigation-drawer v-model="drawerOpen" temporary>
      <v-btn nuxt to="/" size="x-large" variant="plain" :ripple="false"
        >Howard Tseng</v-btn
      >
      <v-divider></v-divider>
      <v-list>
        <v-list-item
          v-for="link in links"
          :key="link.name"
          nuxt
          :to="link.path"
          :prepend-icon="`fas fa-${link.icon}`"
          :title="$t(link.name)"
        >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer class="app-bar" elevation="0" color="background">
      <v-app-bar-nav-icon
        v-if="isMobile"
        v-model="drawerOpen"
        @click="toggleDrawer"
      ></v-app-bar-nav-icon>
      <v-app-bar-title>
        <v-btn nuxt to="/" size="x-large" variant="plain" :ripple="false"
          >Howard Tseng</v-btn
        >
      </v-app-bar-title>
      <NavLinks v-if="!isMobile" />
      <CommonThemeToggle />
    </v-footer>
    <slot />
    <NavFooter />
  </div>
</template>

<style scoped lang="scss">
.app-bar {
  padding: rem(12);
}
</style>
