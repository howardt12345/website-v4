<script setup lang="ts">
import { TimelineItem } from '@/types/about';
import { useMediaQueries } from '@/composables/media-queries';
import { formatDate } from '@/composables/date';

interface Props {
  experiences: TimelineItem[];
}

const props = defineProps<Props>();
const { isMobile } = useMediaQueries();
</script>

<template>
  <h1 class="section-title">{{ $t('Timeline') }}</h1>

  <v-timeline
    align="start"
    side="end"
    :density="isMobile ? 'compact' : 'default'"
  >
    <v-timeline-item
      v-for="experience in props.experiences"
      :key="experience.title"
      dot-color="primary"
      size="small"
      :density="isMobile ? 'compact' : 'default'"
    >
      <template #opposite>
        <v-chip color="primary" text-color="white">
          {{ formatDate(new Date(experience.start_date)) }}
          {{
            experience.end_date &&
            new Date(experience.start_date).getMonth() !==
              new Date(experience.end_date).getMonth()
              ? '-' + formatDate(new Date(experience.end_date))
              : ''
          }}
        </v-chip>
      </template>
      <template #default>
        <AboutTimelineContent
          :experience="experience"
          :is-mobile="isMobile"
        />
      </template>
    </v-timeline-item>
  </v-timeline>
</template>

<style scoped lang="scss"></style>
