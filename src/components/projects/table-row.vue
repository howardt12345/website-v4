<script setup lang="ts">
import { ProjectItem } from '@/types/projects';

interface Props {
  selectedTags?: string[];
  project: ProjectItem;
}

const props = defineProps<Props>();

const selected = computed<number[]>(() => {
  return props.selectedTags
    ? props.selectedTags
        .map((tag) => props.project.tech?.indexOf(tag) ?? -1)
        .filter((index) => index >= 0)
    : [];
});
</script>

<template>
  <tr>
    <td>{{ project.title }}</td>
    <td>
      <ContentRenderer class="content-renderer" :value="project" />
    </td>
    <td>
      <v-chip-group v-model="selected" color="primary">
        <v-chip v-for="tech in project.tech">
          {{ tech }}
        </v-chip>
      </v-chip-group>
    </td>
    <td>{{ formatDate(new Date(project.date)) }}</td>

    <td>
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
    </td>
  </tr>
</template>

<style scoped lang="scss">
.content-renderer {
  margin: rem(8) 0;
}
</style>
