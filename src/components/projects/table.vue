<script setup lang="ts">
import { ProjectItem } from '@/types/projects';

interface Props {
  selectedTags?: string[];
  projects: ProjectItem[];
}

const props = defineProps<Props>();
</script>

<template>
  <v-table>
    <thead>
      <tr>
        <th>{{ $t('Title') }}</th>
        <th>{{ $t('Description') }}</th>
        <th>{{ $t('Tech') }}</th>
        <th>{{ $t('Date') }}</th>
        <th>{{ $t('Links') }}</th>
      </tr>
    </thead>
    <TransitionGroup name="list" tag="tbody">
      <ProjectsTableRow
        v-for="project in projects"
        :key="project.title"
        :project="project"
        :selected-tags="selectedTags"
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
