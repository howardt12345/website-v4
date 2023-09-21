<script setup lang="ts">
import { useArrayFilter } from '@vueuse/core';
import { ProjectItem } from '@/types/projects';

const { data: projects } = await useAsyncData(
  'projects',
  () => queryContent<ProjectItem>('/projects').sort({ date: -1 }).find(),
  { default: () => [] as ProjectItem[] },
);
const { data: tags } = await useAsyncData('projects-tags', () =>
  queryContent<string[]>('/projects').only(['tech']).find(),
);

const featuredProjects = useArrayFilter(
  projects,
  (project: ProjectItem) => project.featured ?? false,
);

const otherProjects = useArrayFilter(
  projects,
  (project: ProjectItem) => !project.featured ?? true,
);

</script>

<template>
  <h1 class="section-title">{{ $t('Projects') }}</h1>
  <ProjectsFeatured :projects="featuredProjects" />
  <ProjectsOther :projects="otherProjects" />
</template>

<style scoped lang="scss"></style>
