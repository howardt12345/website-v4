<script setup lang="ts">
import { ProjectItem } from '@/types/projects';

interface Props {
  project: ProjectItem;
}

const props = defineProps<Props>();
</script>

<template>
  <v-btn
    v-if="project.githubLink"
    icon="fab fa-github"
    :href="project.githubLink"
    target="_blank"
    rel="nofollow noopener noreferrer"
    variant="plain"
  ></v-btn>
  <v-btn
    v-if="project.externalLink"
    icon="fas fa-arrow-up-right-from-square"
    :href="project.externalLink"
    target="_blank"
    rel="nofollow noopener noreferrer"
    variant="plain"
  ></v-btn>
</template>
