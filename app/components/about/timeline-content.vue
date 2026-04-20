<script setup lang="ts">
import type { TimelineItem } from '~/types/about';
import { getDateRangeLabel } from '~/composables/date';

interface Props {
  experience: TimelineItem;
  isMobile: boolean;
  selectedSkills: string[];
}

const props = defineProps<Props>();
const selected = computed<string[]>(() => props.selectedSkills ?? []);
</script>

<template>
  <v-card class="timeline-card" elevation="0">
    <v-card-title class="timeline-card__header">
      <div class="timeline-card__header-info">
        <span class="timeline-card__title-text">{{ experience.title }}</span>
        <span
          v-if="experience.organization"
          class="timeline-card__title-org"
        >
          @ {{ experience.organization }}
        </span>
      </div>
      <div class="timeline-card__header-actions">
        <span
          v-if="experience.location && !isMobile"
          class="timeline-card__location"
        >
          <v-icon size="x-small">fas fa-map-marker-alt</v-icon>
          {{ experience.location }}
        </span>
        <v-btn
          v-if="experience.link"
          :icon="true"
          size="small"
          variant="plain"
          color="primary"
          :href="experience.link.url"
          target="_blank"
          rel="nofollow noopener noreferrer"
          class="timeline-card__link-btn"
        >
          <v-icon size="small">fas fa-arrow-up-right-from-square</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-subtitle>
      <div>
        {{ getDateRangeLabel(experience.start_date, experience.end_date) }}
      </div>
      <div
        v-if="experience.location && isMobile"
        class="timeline-card__location"
      >
        <v-icon size="x-small">fas fa-map-marker-alt</v-icon>
        {{ experience.location }}
      </div>
    </v-card-subtitle>

    <v-card-text>
      <ContentRenderer class="content-renderer" :value="experience" />
    </v-card-text>

    <v-card-actions v-if="experience.skills" class="timeline-card__actions">
      <v-chip-group
        v-model="selected"
        class="timeline-card__chip-group"
        color="primary"
      >
        <v-chip
          v-for="skill in experience.skills"
          :key="skill"
          class="timeline-card__chip"
          :value="skill"
          variant="tonal"
        >
          {{ skill }}
        </v-chip>
      </v-chip-group>
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="scss">
.timeline-card {
  width: 100%;
  background-color: transparent;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: rem(8);
    white-space: normal;
    padding-top: rem(8);
    padding-bottom: 0;

    &-info {
      display: flex;
      flex-direction: column;
      gap: rem(2);
    }

    &-actions {
      display: flex;
      align-items: center;
      gap: rem(2);
      flex-shrink: 0;
      margin-top: rem(2);
    }
  }

  &__title-text {
    color: $text;
    font-size: rem(17);
    font-weight: 500;
    line-height: 1.4;
  }

  &__title-org {
    color: $accent;
    font-size: rem(14);
    font-weight: 400;
  }

  &__link-btn {
    height: auto;
    padding: rem(4);
  }

  &__location {
    font-size: rem(13);
    display: flex;
    align-items: center;
    gap: rem(4);
    white-space: nowrap;
  }

  &__actions {
    padding-top: 0;
  }

  &__chip-group {
    padding: rem(4);
    padding-top: 0;
  }
}
</style>
