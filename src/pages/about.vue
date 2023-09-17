<script setup lang="ts">
const { data } = await useAsyncData('about-content', () =>
  queryContent('/about').findOne(),
);
</script>

<template>
  <h1 class="section-title">About</h1>
  <div class="about-content" v-if="data">
    <ContentRenderer class="content-renderer" :value="data" />
    <v-btn href="/resume.pdf" target="_blank" size="large" color="primary"
      >Resume</v-btn
    >
  </div>
</template>

<style scoped lang="scss">
.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-renderer {
  :deep(p) {
    margin-bottom: rem(8) !important;
  }
}
</style>
