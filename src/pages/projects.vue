<script setup lang="ts">
import { useArrayFilter } from '@vueuse/core';
import { ProjectItem } from '@/types/projects';

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
  () =>
    queryContent<TechOnly>('/projects').only('tech').sort({ tech: 1 }).find(),
  {
    default: () => [] as TechOnly[],
  },
);

const featuredProjects = useArrayFilter(
  projects,
  (project: ProjectItem) => project.featured ?? false,
);

const otherProjects = computed<ProjectItem[]>(() =>
  projects.value.filter((project) => !project.featured).splice(0, 9),
);

const uniqueTags = computed<Set<string>>(
  () => new Set(tags.value.map((tag) => tag.tech).flat()),
);

const selectedTags = ref<string[]>([]);

const filteredProjects = useArrayFilter(
  projects,
  (project: ProjectItem) =>
    !selectedTags.value.length ||
    selectedTags.value.some((tag) => project.tech?.includes(tag)),
);

const showFilters = ref(false);

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};
</script>

<template>
  <h1 class="section-title">{{ $t('Projects') }}</h1>

  <v-btn
    class="filter-button"
    @click="toggleFilters"
    :prepend-icon="showFilters ? 'fas fa-xmark' : 'fas fa-magnifying-glass'"
    :text="showFilters ? $t('Show Featured Projects') : $t('View All Projects')"
    size="large"
  />

  <Transition name="a-project-filter">
    <div v-if="showFilters">
      <ProjectsFilterChips
        class="filter-chips"
        :tags="Array.from(uniqueTags)"
        v-model:selected-tags="selectedTags"
      />
      <ProjectsTable
        :projects="filteredProjects"
        :selected-tags="selectedTags"
      />
    </div>
  </Transition>
  <Transition name="a-project-featured" appear>
    <div v-if="!showFilters">
      <ProjectsFeatured
        v-if="featuredProjects.length > 0"
        :projects="featuredProjects"
      />
      <ProjectsOther :projects="otherProjects" />
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.filter-button {
  margin: rem(16) 0;
}

.filter-chips {
  margin-bottom: rem(16);
}

.a-project-filter-enter-active,
.a-project-filter-leave-active {
  transition: all 0.3s ease-out;
}

.a-project-filter-enter-from,
.a-project-filter-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.a-project-featured-enter-active,
.a-project-featured-leave-active {
  transition: all 0.3s ease-out;
}

.a-project-featured-enter-from,
.a-project-featured-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
