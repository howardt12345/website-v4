<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTheme } from '@/store/theme.store';
import { useMounted } from '@vueuse/core';

const { isDark } = storeToRefs(useTheme());
const { toggleTheme } = useTheme();
const isMounted = useMounted();
</script>

<template>
  <main v-if="isMounted">
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
