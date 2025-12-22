<script setup lang="ts">
const { data: aboutContent } = await useAsyncData('about-content', () =>
  queryCollection('about').first(),
);
const { data: experiences } = await useAsyncData('experiences', () =>
  queryCollection('experiences').order('start_date', 'DESC').all(),
);
</script>

<template>
  <div class="content-container">
    <AboutContent v-if="aboutContent" :data="aboutContent" />
    <AboutTimeline v-if="experiences" :experiences="experiences" />
  </div>
</template>

<style scoped lang="scss"></style>
