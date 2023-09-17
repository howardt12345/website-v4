<script setup lang="ts">
const { data: aboutContent } = await useAsyncData('about-content', () =>
  queryContent('/about').findOne(),
);
</script>

<template>
  <AboutContent v-if="aboutContent" :data="aboutContent" />
</template>

<style scoped lang="scss"></style>
