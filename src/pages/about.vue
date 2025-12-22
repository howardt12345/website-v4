<script setup lang="ts">
import type { TimelineItem } from '@/types/about';

const { data: aboutContent } = await useAsyncData('about-content', () =>
  queryContent('/about').findOne(),
);
const { data: experiences } = await useAsyncData('experiences', () =>
  queryContent<TimelineItem>('/about/experiences')
    .sort({ start_date: -1 })
    .find(),
);
</script>

<template>
  <div class="content-container">
    <AboutContent v-if="aboutContent" :data="aboutContent" />
    <AboutTimeline v-if="experiences" :experiences="experiences" />
  </div>
</template>

<style scoped lang="scss"></style>
