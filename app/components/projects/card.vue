<script setup lang="ts">
import type { ProjectItem } from '~/types/projects';
import { formatDate } from '~/composables/date';

interface Props {
  project: ProjectItem;
  showImage?: boolean;
}

defineProps<Props>();
</script>

<template>
  <v-card
    class="projects-card"
    variant="flat"
    border
    :image="showImage ? project.imagePath : ''"
  >
    <v-card-title class="projects-card__title">
      <component
        :is="project.externalLink ? 'a' : 'span'"
        :href="project.externalLink"
        target="_blank"
        rel="nofollow noopener noreferrer"
        class="projects-card__title-text"
      >
        {{ project.title }}
      </component>
    </v-card-title>

    <v-card-subtitle>
      <div>
        {{ formatDate(new Date(project.date)) }}
      </div>
    </v-card-subtitle>

    <v-card-text>
      <ContentRenderer class="content-renderer" :value="project" />
    </v-card-text>

    <v-card-actions v-if="project.tech" class="projects-card__actions">
      <v-chip-group class="projects-card__actions-chips">
        <v-chip v-for="tech in project.tech" :key="tech" color="primary" variant="tonal">
          {{ tech }}
        </v-chip>
      </v-chip-group>
      <div class="projects-card__actions-links">
        <ProjectsLinks :project="project" />
      </div>
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="scss">
.projects-card {
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.25s ease, transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }

  :deep(.v-card__image) {
    filter: blur(1px) opacity(20%);
  }

  :deep(.v-card-title) {
    padding: rem(20) rem(20) rem(6);
    white-space: normal;
  }

  :deep(.v-card-subtitle) {
    padding: 0 rem(20) rem(8);
  }

  :deep(.v-card-text) {
    padding: 0 rem(20) rem(12);
  }

  :deep(.v-card-actions) {
    padding: 0 rem(12) rem(12);
  }

  &__title {
    &-text {
      text-decoration: none;
      color: inherit;
      transition: color $transition-fast;

      &:hover,
      &:focus {
        color: $accent;
      }
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    &-chips {
      padding: rem(4) rem(4) 0;
    }

  }
}

.content-renderer {
  :deep(p) {
    margin: 0;
  }
}
</style>
