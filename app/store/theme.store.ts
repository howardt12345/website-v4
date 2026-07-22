import { defineStore } from 'pinia';
import { useTheme as useVuetifyTheme } from 'vuetify';
import { readStorage, writeStorage } from '~/utils/storage';
import { theme_light, theme_dark } from '~/assets/theme/theme';

type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const BACKGROUND: Record<ThemeName, string> = {
  light: theme_light.colors.background,
  dark: theme_dark.colors.background,
};

export const useTheme = defineStore('theme', () => {
  const theme = useVuetifyTheme();
  const isDark = computed(() => theme.global.current.value.dark);

  const apply = (name: ThemeName, persist: boolean) => {
    theme.global.name.value = name;
    if (!import.meta.client) return;
    document.documentElement.dataset.theme = name;
    document.documentElement.style.backgroundColor = BACKGROUND[name];
    if (persist) writeStorage('local', STORAGE_KEY, name);
  };

  const init = () => {
    if (!import.meta.client) return;
    const stored = readStorage('local', STORAGE_KEY);
    const preferred =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
    apply(preferred, false);
  };

  const toggleTheme = () => apply(isDark.value ? 'light' : 'dark', true);

  return { isDark, toggleTheme, init };
});
