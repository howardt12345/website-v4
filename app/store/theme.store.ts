import { defineStore } from 'pinia';
import { useTheme as useVuetifyTheme } from 'vuetify';

export const useTheme = defineStore('theme', () => {
  const theme = useVuetifyTheme();
  const isDark = computed(() => theme.global.current.value.dark);
  const toggleTheme = () => {
    theme.global.name.value = isDark.value ? 'light' : 'dark';
  };

  return {
    isDark,
    toggleTheme,
  };
});
