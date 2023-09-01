<script setup lang="ts">
useHead({
  link: [{ rel: 'icon', type: 'image/png', href: 'favicon.ico' }],
});
</script>

<template>
  <v-app>
    <NuxtPage />
  </v-app>
</template>

<style scoped>
@font-face {
  font-family: 'Poppins';
  src: url('assets/fonts/Poppins/Poppins-Regular.ttf') format('truetype');
}
</style>
