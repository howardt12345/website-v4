<script setup lang="ts">
import { useTheme } from '@/store/theme.store';
const { isDark } = storeToRefs(useTheme());
const { toggleTheme } = useTheme();
</script>

<template>
  <v-btn
    :icon="isDark ? 'fas fa-sun' : 'fas fa-moon'"
    variant="plain"
    @click="toggleTheme"
  ></v-btn>
</template>
