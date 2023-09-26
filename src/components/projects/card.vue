<script setup lang="ts">
import { ProjectItem } from '@/types/projects';
import { useTheme } from '@/store/theme.store';
import { formatDate } from '@/composables/date';

interface Props {
  project: ProjectItem;
  showImage?: boolean;
}

const props = defineProps<Props>();
const { isDark } = storeToRefs(useTheme());
</script>

<template>
  <v-card
    :class="{
      'projects-card': true,
      'projects-card--outlined': !isDark,
    }"
    variant="flat"
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
        <v-chip v-for="tech in project.tech">
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

  &--outlined {
    border: 1px solid $text !important;
  }

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
      direction: ltr;
    }
  }
}

.content-renderer {
  direction: ltr;
  :deep(p) {
    margin: 0;
  }
}
</style>
