<script setup lang="ts">
import { useTheme } from '~/store/theme.store';
const { isDark } = storeToRefs(useTheme());
const { toggleTheme } = useTheme();
</script>

<template>
  <v-btn
    :icon="isDark ? 'fas fa-sun' : 'fas fa-moon'"
    :aria-label="isDark ? $t('Switch to light theme') : $t('Switch to dark theme')"
    :aria-pressed="isDark"
    variant="plain"
    @click="toggleTheme"
  />
</template>
