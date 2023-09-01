import { defineStore } from 'pinia';
import { useTheme } from 'vuetify';
import { computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = useTheme();
  const isDark = computed(() => theme.global.current.value.dark);
  const toggleTheme = () => {
    theme.global.name.value = theme.global.current.value.dark
      ? 'light'
      : 'dark';
  };

  return {
    isDark,
    toggleTheme,
  };
});
