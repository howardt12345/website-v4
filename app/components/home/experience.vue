<script setup lang="ts">
const { data: experiences } = await useAsyncData('experiences', () =>
  queryCollection('experiences').order('start_date', 'DESC').all(),
);
</script>

<template>
  <AboutTimeline v-if="experiences" :experiences="experiences" />
</template>
