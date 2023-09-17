<script setup lang="ts">
const { data } = await useAsyncData('content-/about', () =>
  queryContent('/about').findOne(),
);
console.log(data);
</script>

<template>
  <h1 class="section-title">About</h1>
  <ContentRenderer v-if="data" :value="data" />
</template>

<style scoped lang="scss"></style>
