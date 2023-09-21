<script setup lang="ts">
import { ProjectItem } from '@/types/projects';
import { useMediaQueries } from '@/composables/media-queries';

interface Props {
  selectedTags?: string[];
  projects: ProjectItem[];
}

const props = defineProps<Props>();

const { isMobile, isTablet } = useMediaQueries();
</script>

<template>
  <v-table>
    <thead>
      <tr>
        <th>{{ $t('Date') }}</th>
        <th>{{ $t('Title') }}</th>
        <th v-if="!isTablet">{{ $t('Description') }}</th>
        <th v-if="!isMobile">{{ $t('Tech') }}</th>
        <th>{{ $t('Links') }}</th>
      </tr>
    </thead>
    <TransitionGroup name="list" tag="tbody">
      <ProjectsTableRow
        v-for="project in projects"
        :key="project.title"
        :project="project"
        :selected-tags="selectedTags"
        :hide-description="isTablet"
        :hide-tech="isMobile"
      />
    </TransitionGroup>
  </v-table>
</template>

<style scoped lang="scss">
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
