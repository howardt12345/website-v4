<script setup lang="ts">
import { usei18n } from '~/store/i18n.store';
import { useTheme } from '~/store/theme.store';

const siteUrl = useRuntimeConfig().public.siteUrl as string;

useHead({
  link: [{ rel: 'icon', href: '/favicon.ico' }],
});

useSeoMeta({
  title: 'Howard Tseng',
  ogTitle: 'Howard Tseng',
  description:
    'Howard Tseng is a freelance photographer specializing in event and portrait photography, as well as a full-stack developer proficient in Vue, React, and Angular based in Ottawa, Ontario, Canada.',
  ogDescription:
    'Howard Tseng is a freelance photographer specializing in event and portrait photography, as well as a full-stack developer proficient in Vue, React, and Angular based in Ottawa, Ontario, Canada.',
  ogType: 'website',
  ogImage: siteUrl ? `${siteUrl}/images/og-default.jpg` : undefined,
  twitterCard: 'summary_large_image',
});

const themeStore = useTheme();
const { isDark } = storeToRefs(themeStore);
onMounted(themeStore.init);

usei18n();

useImageProtection();
</script>

<template>
  <v-app>
    <NuxtLoadingIndicator />
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
          <v-progress-circular indeterminate color="primary" size="48" />
        </div>
      </template>
    </Suspense>
  </v-app>
</template>

<style lang="scss">
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
