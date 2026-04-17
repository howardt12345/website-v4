<script setup lang="ts">
const { data: aboutContent } = await useAsyncData('about-content', () =>
  queryCollection('about').first(),
);
</script>

<template>
  <AboutContent v-if="aboutContent" :data="aboutContent" />
</template>
