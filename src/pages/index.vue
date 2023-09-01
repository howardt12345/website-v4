<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/store/theme.store';

const { isDark } = storeToRefs(useThemeStore());
const { toggleTheme } = useThemeStore();
</script>

<template>
  <main>
    <HomeTitle />
    <v-btn
      :icon="isDark ? 'fas fa-sun' : 'fas fa-moon'"
      @click="toggleTheme"
    ></v-btn>
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
