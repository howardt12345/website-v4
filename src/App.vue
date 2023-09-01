<script setup lang="ts">
import { i18nextPromise } from '@/plugins/i18n';
useHead({
  link: [{ rel: 'icon', type: 'image/png', href: 'favicon.ico' }],
});

await i18nextPromise;
</script>

<template>
  <Suspense>
    <v-app>
      <NuxtPage />
    </v-app>
    <template #fallback>
      <div>
        <h1>Loading...</h1>
      </div>
    </template>
  </Suspense>
</template>

<style scoped>
@font-face {
  font-family: 'Poppins';
  src: url('assets/fonts/Poppins/Poppins-Regular.ttf') format('truetype');
}
</style>
