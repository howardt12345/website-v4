<script setup lang="ts">
import { i18nextPromise } from '@/plugins/i18n';
import { usei18n } from './store/i18n.store';
useHead({
  link: [{ rel: 'icon', type: 'image/png', href: 'favicon.ico' }],
});

useSeoMeta({
  title: 'Howard Tseng',
  ogTitle: 'Howard Tseng',
  description:
    'Howard Tseng is a freelance photographer specializing in event and portrait photography, as well as a full-stack developer proficient in Vue, React, and Angular based in Ottawa, Ontario, Canada.',
  ogDescription:
    'Howard Tseng is a freelance photographer specializing in event and portrait photography, as well as a full-stack developer proficient in Vue, React, and Angular based in Ottawa, Ontario, Canada.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
});

await i18nextPromise;

usei18n();
</script>

<template>
  <Suspense>
    <v-app>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
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
