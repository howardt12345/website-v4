<script setup lang="ts">
import { useTheme } from 'vuetify';
const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
};
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
