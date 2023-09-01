import { defineStore } from 'pinia';
import { useTheme } from 'vuetify';

export const useThemeStore = defineStore('theme', () => {
  const theme = useTheme();
  const isDark = computed(() => theme.global.current.value.dark);
  const toggleTheme = () => {
    theme.global.name.value = isDark.value ? 'light' : 'dark';
  };

  return {
    isDark,
    toggleTheme,
  };
});
