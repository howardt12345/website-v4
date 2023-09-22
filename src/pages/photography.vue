<script setup lang="ts">
import { usePhotosStore } from '@/store/photos.store';

const { photos } = storeToRefs(usePhotosStore());
</script>

<template>
  <h1 class="section-title">Photos</h1>
</template>

<style scoped lang="scss"></style>
