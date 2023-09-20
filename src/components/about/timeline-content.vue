<script setup lang="ts">
import { TimelineItem } from '@/types/about';

interface Props {
  experience: TimelineItem;
  currentLanguage: string;
  isMobile: boolean;
}

const props = defineProps<Props>();

const formatDate = (date: Date) =>
  date.toLocaleDateString(props.currentLanguage, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
</script>

<template>
  <v-card class="timeline-card">
    <v-card-title class="timeline-card__title">
      <v-toolbar color="rgba(0, 0, 0, 0)" height="auto">
        <v-toolbar-title class="timeline-card__title_toolbar">
          <template #text>
            <span>{{ experience.title }}</span>
            <span
              v-if="experience.organization"
              class="timeline-card__title_subtitle"
            >
              @ {{ experience.organization }}
            </span>
          </template>
        </v-toolbar-title>

        <template v-slot:append>
          <div
            v-if="experience.location && !isMobile"
            class="timeline-card__location"
          >
            <v-icon small>fas fa-map-marker-alt</v-icon>
            {{ experience.location }}
          </div>
          <v-btn
            v-if="experience.link"
            icon="fas fa-arrow-up-right-from-square"
            color="primary"
            class="timeline-card__link"
            :href="experience.link.url"
            target="_blank"
            rel="nofollow noopener noreferrer"
          ></v-btn>
        </template>
      </v-toolbar>
    </v-card-title>

    <v-card-subtitle>
      <div>
        {{ formatDate(new Date(experience.start_date)) }}
        {{
          experience.end_date
            ? '-' + formatDate(new Date(experience.end_date))
            : ''
        }}
      </div>
      <div
        v-if="experience.location && isMobile"
        class="timeline-card__location"
      >
        <v-icon small>fas fa-map-marker-alt</v-icon>
        {{ experience.location }}
      </div>
    </v-card-subtitle>

    <v-card-text>
      <ContentRenderer class="content-renderer" :value="experience" />
    </v-card-text>

    <v-card-actions v-if="experience.skills">
      <v-chip-group>
        <v-chip v-for="skill in experience.skills" class="timeline-card__chip">
          {{ skill }}
        </v-chip>
      </v-chip-group>
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="scss">
.timeline-card {
  width: 100%;

  &__title {
    padding-right: 0;
    color: $text;

    &_toolbar {
      margin: 0;

      :deep(.v-toolbar-title__placeholder) {
        white-space: normal;
      }
    }

    &_subtitle {
      margin: 0;
      color: $accent;
    }
  }

  &__location {
    color: $text-secondary;
    font-size: rem(16);
    margin-right: rem(8);

    @media (max-width: 480px) {
      margin-top: rem(8);
    }
  }

  &__chip {
    margin-right: rem(8);
    margin-bottom: rem(8);
  }
}
</style>
