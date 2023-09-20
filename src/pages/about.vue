<script setup lang="ts">
import { TimelineItem } from '@/types/about';

const { data: aboutContent } = await useAsyncData('about-content', () =>
  queryContent('/about').findOne(),
);
// Read all the files in the about/experiences folder, and read the body as description
const { data: experiences } = await useAsyncData('experiences', () =>
  queryContent<TimelineItem>('/about/experiences')
    .sort({ start_date: -1 })
    .find(),
);

console.log(experiences);
</script>

<template>
  <AboutContent v-if="aboutContent" :data="aboutContent" />
  <AboutTimeline v-if="experiences" :experiences="experiences" />
</template>

<style scoped lang="scss"></style>
