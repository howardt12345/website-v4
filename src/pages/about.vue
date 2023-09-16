<script setup lang="ts">
const { data } = await useAsyncData('content', () =>
  queryContent('/about').findOne(),
);
console.log(data);
</script>

<template>
  <h1 class="section-title">About</h1>
  <ContentRenderer :value="data" />
</template>

<style scoped lang="scss"></style>
