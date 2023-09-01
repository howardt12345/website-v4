<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTheme } from '@/store/theme.store';
import { usei18n } from '@/store/i18n.store';
import { useMounted } from '@vueuse/core';

const { isDark } = storeToRefs(useTheme());
const { toggleTheme } = useTheme();
const isMounted = useMounted();

const { changeLanguage } = usei18n();
const { languages } = storeToRefs(usei18n());
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
