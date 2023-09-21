<script setup lang="ts">
import { ProjectItem } from '@/types/projects';

interface Props {
  project: ProjectItem;
  showImage?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <v-card
    class="projects-card"
    variant="flat"
    :image="showImage && project.imagePath"
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
        <v-chip v-for="tech in project.tech">
          {{ tech }}
        </v-chip>
      </v-chip-group>
      <div class="projects-card__actions-links">
        <v-btn
          v-if="project.githubLink"
          icon="fab fa-github"
          :href="project.githubLink"
          target="_blank"
          rel="nofollow noopener noreferrer"
        ></v-btn>
        <v-btn
          v-if="project.externalLink"
          icon="fas fa-arrow-up-right-from-square"
          :href="project.externalLink"
          target="_blank"
          rel="nofollow noopener noreferrer"
        ></v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="scss">
.projects-card {
  width: 100%;
  z-index: 1;

  :deep(.v-card__image) {
    filter: blur(1px) opacity(20%);
  }

  &__title {
    white-space: normal;

    &-text {
      text-decoration: none;
      color: inherit;

      &:hover,
      &:focus {
        color: $accent;
      }
    }
  }

  &__actions {
    padding-top: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    &-chips {
      padding: rem(4);
      padding-top: 0;
    }

    &-links {
      direction: ltr !important;
    }
  }
}
</style>
