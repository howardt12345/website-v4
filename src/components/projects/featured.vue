import projectsVue from '~/pages/projects.vue';
<script setup lang="ts">
import { ProjectItem } from '@/types/projects';
import { formatDate } from '@/composables/date';
import { useMediaQueries } from '@/composables/media-queries';

interface Props {
  projects: ProjectItem[];
}

const props = defineProps<Props>();
const { isTablet } = useMediaQueries();
</script>

<template>
  <h2 class="section-subtitle">{{ $t('Featured Projects') }}</h2>
  <v-timeline :side="isTablet ? 'end' : ''" :line-thickness="isTablet ? 2 : 0">
    <v-timeline-item
      v-for="(project, index) in projects"
      :hide-dot="!isTablet"
      dot-color="primary"
      :class="{
        'timeline-item-right': !isTablet && index % 2 === 0,
      }"
      :key="project.title"
    >
      <template #opposite>
        <div class="project-image__container">
          <v-card
            v-if="!isTablet"
            :class="{
              'project-image': true,
              'project-image-right': index % 2 === 0,
            }"
            variant="outlined"
          >
            <v-img
              :src="project.imagePath"
              :aspect-ratio="16 / 9"
              cover
            ></v-img>
          </v-card>
        </div>
      </template>
      <template #default>
        <v-card
          class="project-card"
          variant="flat"
          :image="isTablet && project.imagePath"
        >
          <v-card-title class="project-card__title">
            <component
              :is="project.externalLink ? 'a' : 'span'"
              :href="project.externalLink"
              target="_blank"
              rel="nofollow noopener noreferrer"
              class="project-card__title-text"
            >
              {{ project.title }}
            </component>
          </v-card-title>

          <v-card-subtitle>
            <div>
              {{ formatDate(new Date(project.date)) }}
            </div>
            <div v-if="project.link">
              <v-btn
                icon
                :href="project.link.url"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                <v-icon>fas fa-arrow-up-right-from-square</v-icon>
              </v-btn>
            </div>
          </v-card-subtitle>

          <v-card-text>
            <ContentRenderer :value="project" />
          </v-card-text>

          <v-card-actions v-if="project.tech" class="project-card__actions">
            <v-chip-group>
              <v-chip v-for="tech in project.tech">
                {{ tech }}
              </v-chip>
            </v-chip-group>
            <div class="project-card__actions-links">
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
    </v-timeline-item>
  </v-timeline>
</template>

<style scoped lang="scss">
.timeline-item-right {
  text-align: right !important;
  direction: rtl !important;

  :deep(.v-timeline-item__opposite) {
    justify-self: normal !important;
  }
}

.project-image {
  &__container {
    width: 100%;
  }

  margin-left: -25%;
  width: 125%;

  &-right {
    margin-left: 0;
    margin-right: -25%;
  }
}

.project-card {
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

    &-links {
      direction: ltr !important;
    }
  }
}
</style>
