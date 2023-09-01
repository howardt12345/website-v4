import { defineStore } from 'pinia';
import { useTheme } from 'vuetify';
import { computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = useTheme();
  const isDark = computed(() => theme.global.current.value.dark);
  const toggleTheme = () => {
    isDark.value ? 'light' : 'dark';
  };

  return {
    isDark,
    toggleTheme,
  };
});
