<script setup lang="ts">
import { useArrayFilter } from '@vueuse/core';
import { ProjectItem } from '@/types/projects';
import { compile } from 'nuxt/dist/app/compat/capi';

interface TechOnly {
  tech: string[];
}

const { data: projects } = await useAsyncData(
  'projects',
  () => queryContent<ProjectItem>('/projects').sort({ date: -1 }).find(),
  { default: () => [] as ProjectItem[] },
);
const { data: tags } = await useAsyncData(
  'projects-tags',
  () => queryContent<TechOnly>('/projects').only('tech').find(),
  {
    default: () => [] as TechOnly[],
  },
);

const featuredProjects = useArrayFilter(
  projects,
  (project: ProjectItem) => project.featured ?? false,
);

const otherProjects = useArrayFilter(
  projects,
  (project: ProjectItem) => !project.featured ?? true,
);

const uniqueTags = computed<Set<string>>(
  () => new Set(tags.value.map((tag) => tag.tech).flat()),
);

const selectedTags = ref<string[]>([]);
</script>

<template>
  <h1 class="section-title">{{ $t('Projects') }}</h1>
  <!-- <ProjectsFiltered :tags="Array.from(uniqueTags)" v-model:selected-tags="selectedTags" />
  <div>{{ selectedTags }}</div> -->
  <ProjectsFeatured :projects="featuredProjects" />
  <ProjectsOther :projects="otherProjects" />
</template>

<style scoped lang="scss"></style>
