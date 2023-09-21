<script setup lang="ts">
import { ProjectItem } from '@/types/projects';

const { data: projects } = await useAsyncData('projects', () =>
  queryContent<ProjectItem>('/projects').sort({ date: -1 }).find(),
);

const featuredProjects = computed<ProjectItem[]>(
  () => projects?.value?.filter((project) => project.featured) ?? [],
);

const otherProjects = computed<ProjectItem[]>(
  () => projects?.value?.filter((project) => !project.featured) ?? [],
);
</script>

<template>
  <h1 class="section-title">{{ $t('Projects') }}</h1>
  <ProjectsFeatured :projects="featuredProjects" />
</template>

<style scoped lang="scss"></style>
