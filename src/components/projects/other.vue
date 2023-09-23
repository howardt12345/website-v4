<script setup lang="ts">
import { ProjectItem } from '@/types/projects';

interface Props {
  projects: ProjectItem[];
}
const props = defineProps<Props>();
</script>

<template>
  <h2 class="section-subtitle">{{ $t('Other Recent Projects') }}</h2>
  <v-container>
    <v-row>
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

<style scoped lang="scss"></style>
