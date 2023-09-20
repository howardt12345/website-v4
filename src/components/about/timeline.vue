<script setup lang="ts">
import { TimelineItem } from '@/types/about';
import { usei18n } from '@/store/i18n.store';
import { useMediaQueries } from '@/composables/media-queries';

interface Props {
  experiences: TimelineItem[];
}

const props = defineProps<Props>();
const { currentLanguage } = storeToRefs(usei18n());
const { isMobile } = useMediaQueries();

const dateText = (date: Date) =>
  date.toLocaleDateString(currentLanguage.value, {
    year: 'numeric',
    month: 'short',
  });
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
          {{ dateText(new Date(experience.start_date)) }}
          {{
            experience.end_date &&
            new Date(experience.start_date).getMonth() !==
              new Date(experience.end_date).getMonth()
              ? '-' + dateText(new Date(experience.end_date))
              : ''
          }}
        </v-chip>
      </template>
      <template #default>
        <AboutTimelineContent
          :experience="experience"
          :current-language="currentLanguage"
        />
      </template>
    </v-timeline-item>
  </v-timeline>
</template>

<style scoped lang="scss">
</style>
