<script setup lang="ts">
// @ts-expect-error avoid lint error
import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import { computedAsync } from '@vueuse/core';

const route = useRoute();

const id = computed<string>(() => route.params.id.toString() ?? '');

const blogPage = computedAsync(async () => {
  const { data } = await useFetch(`/api/notion/blog/${id.value}`);
  return data?.value?.body.page ?? null;
});

const blogContent = computed<string>(() => blogPage.value?.content ?? '');
</script>

<template>
  <div class="content-container">
    <div v-if="id">
      {{ id }}
    </div>
    <MDC v-if="blogContent" :value="blogContent" tag="article" />
  </div>
</template>
