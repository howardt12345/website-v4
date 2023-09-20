<script setup lang="ts">
import { TimelineItem } from '@/types/about';

interface Props {
  experience: TimelineItem;
  currentLanguage: string;
}

const props = defineProps<Props>();

const dateText = (date: Date) =>
  date.toLocaleDateString(props.currentLanguage, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
</script>

<template>
  <v-card class="timeline-card">
    <v-card-title>
      <v-toolbar color="rgba(0, 0, 0, 0)" theme="dark">
        <v-toolbar-title class="timeline-card__title">
          <h3 class="timeline-card__title">{{ experience.title }}</h3>
          <h4 v-if="experience.organization" class="timeline-card__subtitle">
            @ {{ experience.organization }}
          </h4>
        </v-toolbar-title>

        <template v-slot:append>
          <div v-if="experience.location" class="timeline-card__location">
            <v-icon small>fas fa-map-marker-alt</v-icon>
            {{ experience.location }}
          </div>
          <v-btn
            v-if="experience.link"
            icon="fas fa-arrow-up-right-from-square"
            :href="experience.link.url"
            target="_blank"
            rel="nofollow noopener noreferrer"
          ></v-btn>
        </template>
      </v-toolbar>
    </v-card-title>

    <v-card-subtitle>
      {{ dateText(new Date(experience.start_date)) }}
      {{
        experience.end_date ? '-' + dateText(new Date(experience.end_date)) : ''
      }}
    </v-card-subtitle>

    <v-card-text>
      <ContentRenderer class="content-renderer" :value="experience" />
    </v-card-text>

    <v-card-actions v-if="experience.skills">
      <v-chip v-for="skill in experience.skills" class="timeline-card__chip">
        {{ skill }}
      </v-chip>
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="scss">
.timeline-card {
  width: 100%;

  &__title {
    margin: 0;
  }

  &__subtitle {
    margin: 0;
    color: $accent;
  }

  &__location {
    color: $text-secondary;
    font-size: rem(16);
    margin-right: rem(8);
  }

  &__chip {
    margin-right: rem(8);
    margin-bottom: rem(8);
  }
}
</style>
