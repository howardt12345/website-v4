<script setup lang="ts">
import type { ProjectItem } from '~/types/projects';

interface Props {
  selectedTags?: string[];
  hideDescription?: boolean;
  hideTech?: boolean;
  project: ProjectItem;
}

const props = defineProps<Props>();
const emit = defineEmits<{ toggleTag: [tag: string] }>();

const selected = computed<string[]>(() =>
  (props.selectedTags ?? []).filter((tag) => props.project.tech?.includes(tag)),
);
</script>

<template>
  <tr>
    <td>{{ formatDate(new Date(project.date)) }}</td>
    <td class="title">{{ project.title }}</td>
    <td v-if="!hideDescription">
      <ContentRenderer class="content-renderer" :value="project" />
    </td>
    <td v-if="!hideTech">
      <v-chip-group :model-value="selected" multiple color="primary">
        <v-chip
          v-for="tech in project.tech"
          :key="tech"
          :value="tech"
          @click="emit('toggleTag', tech)"
        >
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
  font-weight: 600;
}

.links {
  vertical-align: top;
}
</style>
