<script setup lang="ts">
import type { ProjectItem } from '~/types/projects';

interface Props {
  projects: ProjectItem[];
}
defineProps<Props>();
</script>

<template>
  <h2 class="section-subtitle">{{ $t('Other Recent Projects') }}</h2>
  <v-container class="other-projects">
    <v-row dense>
      <v-col
        v-for="(project, index) in projects"
        :key="`other-project-${index}`"
        cols="12"
        sm="12"
        md="6"
        lg="4"
      >
        <ProjectsCard :project="project" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.other-projects {
  padding: 0;
  margin-top: rem(20);

  :deep(.v-col) {
    display: flex;
  }
}
</style>
