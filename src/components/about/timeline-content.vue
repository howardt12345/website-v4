<script setup lang="ts">
import { TimelineItem } from '@/types/about';
import { formatDate } from '@/composables/date';
const { isMobile } = useMediaQueries();

interface Props {
  experience: TimelineItem;
  isMobile: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <v-card class="timeline-card" elevation="0" :side="isMobile ? 'end' : ''">
    <v-card-title class="timeline-card__title">
      <v-toolbar color="rgba(0, 0, 0, 0)" height="auto">
        <v-toolbar-title class="timeline-card__title_toolbar">
          <template #text>
            <span class="timeline-card__title_text">{{
              experience.title
            }}</span>
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
            <v-icon size="small">fas fa-map-marker-alt</v-icon>
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
        <v-icon size="x-small">fas fa-map-marker-alt</v-icon>
        {{ experience.location }}
      </div>
    </v-card-subtitle>

    <v-card-text>
      <ContentRenderer class="content-renderer" :value="experience" />
    </v-card-text>

    <v-card-actions v-if="experience.skills" class="timeline-card__actions">
      <v-chip-group class="timeline-card__chip-group">
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
  background-color: rgba(0, 0, 0, 0);

  &__title {
    padding-right: 0;
    padding-top: 0;

    &_toolbar {
      margin: 0;

      :deep(.v-toolbar-title__placeholder) {
        white-space: normal;
        padding-right: rem(8);
      }
    }

    &_text {
      color: $text;
    }

    &_subtitle {
      margin: 0;
      color: $accent;
    }
  }

  &__link {
    height: auto;
  }

  &__location {
    color: $text-secondary;
    font-size: rem(16);
    margin-right: rem(8);

    @media (max-width: 480px) {
      margin-top: rem(8);
    }
  }

  &__actions {
    padding-top: 0;
  }

  &__chip {
    margin-right: rem(8);
    margin-bottom: rem(8);

    &-group {
      padding: rem(4);
      padding-top: 0;
    }
  }
}
</style>
