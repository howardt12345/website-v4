<script setup lang="ts">
import { ProjectItem } from '@/types/projects';

interface Props {
  selectedTags?: string[];
  hideDescription?: boolean;
  hideTech?: boolean;
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
    <td>{{ formatDate(new Date(project.date)) }}</td>
    <td class="title">{{ project.title }}</td>
    <td v-if="!hideDescription">
      <ContentRenderer class="content-renderer" :value="project" />
    </td>
    <td v-if="!hideTech">
      <v-chip-group v-model="selected" color="primary">
        <v-chip v-for="tech in project.tech">
          {{ tech }}
        </v-chip>
      </v-chip-group>
    </td>

    <td class="links">
      <ProjectsLinks :project="project" />
    </td>
  </tr>
</template>

<style scoped lang="scss">
.content-renderer {
  margin: rem(8) 0;
}

.title {
  font-weight: bold;
}

.links {
  vertical-align: top;
}
</style>
