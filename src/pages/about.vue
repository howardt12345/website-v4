<script setup lang="ts">
import { TimelineItem } from '@/types/about';

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
  <AboutContent v-if="aboutContent" :data="aboutContent" />
  <AboutTimeline v-if="experiences" :experiences="experiences" />
</template>

<style scoped lang="scss"></style>
