<script setup lang="ts">
import type { NuxtError } from '#app';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{ error: NuxtError }>();
const { t } = useTranslation();

const isNotFound = computed(() => props.error?.statusCode === 404);
const handleClearError = () => clearError({ redirect: '/' });
</script>

<template>
  <v-app>
    <main class="error-page">
      <p class="error-page__code">{{ error?.statusCode ?? 500 }}</p>
      <h1 class="error-page__title">
        {{ isNotFound ? t('Page not found') : t('Something went wrong') }}
      </h1>
      <p v-if="!isNotFound && error?.statusMessage" class="error-page__message">
        {{ error.statusMessage }}
      </p>
      <v-btn color="primary" variant="flat" @click="handleClearError">
        {{ t('Back to home') }}
      </v-btn>
    </main>
  </v-app>
</template>

<style scoped lang="scss">
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: rem(12);
  padding: rem(24);
  text-align: center;
  background: rgb(var(--v-theme-background));
  color: $text;

  &__code {
    font-size: rem(14);
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: $accent-text;
    margin: 0;
  }

  &__title {
    font-size: clamp(#{rem(32)}, 5vw, #{rem(56)});
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin: 0 0 rem(8);
    color: $text;
  }

  &__message {
    color: $text-secondary;
    margin: 0 0 rem(8);
  }
}
</style>
