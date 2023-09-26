import projectsVue from '~/pages/projects.vue';
<script setup lang="ts">
import { ProjectItem } from '@/types/projects';
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
        <ProjectsCard :project="project" :show-image="isTablet" />
      </template>
    </v-timeline-item>
  </v-timeline>
</template>

<style scoped lang="scss">
.timeline-item-right {
  text-align: right;
  direction: rtl;

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
</style>
