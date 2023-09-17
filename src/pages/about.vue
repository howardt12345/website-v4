<script setup lang="ts">
const { data } = await useAsyncData('about-content', () =>
  queryContent('/about').findOne(),
);
</script>

<template>
  <h1 class="section-title">About</h1>
  <ContentRenderer v-if="data" :value="data" />
</template>

<style scoped lang="scss"></style>
