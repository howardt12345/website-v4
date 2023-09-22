<script setup lang="ts">
import { i18nextPromise } from '@/plugins/03.i18n';
import { usei18n } from '@/store/i18n.store';
import { usePhotosStore } from '@/store/photos.store';
import { useTheme } from '@/store/theme.store';

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

const { isDark } = useTheme();

await i18nextPromise;

usei18n();
usePhotosStore().getPhotos();
</script>

<template>
  <v-app>
    <Suspense>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <template #fallback>
        <div
          :class="{
            'loading-container': true,
            'loading-container--dark': isDark,
          }"
        >
          <h1>Loading...</h1>
        </div>
      </template>
    </Suspense>
  </v-app>
</template>

<style lang="scss">
@font-face {
  font-family: 'Poppins';
  src: url('assets/fonts/Poppins/Poppins-Regular.ttf') format('truetype');
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: white;
  color: black;

  &--dark {
    background-color: black;
    color: white;
  }
}
</style>
