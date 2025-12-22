<script setup lang="ts">
import { TimelineItem } from '~/types/about';
import { useMediaQueries } from '~/composables/media-queries';
import { formatDate } from '~/composables/date';

interface Props {
  experiences: TimelineItem[];
}

const props = defineProps<Props>();
const { isMobile } = useMediaQueries();

const availableSkills = computed<string[]>(() => {
  const tags = new Set<string>();
  props.experiences?.forEach((experience) => {
    experience.skills?.forEach((tag: string) => tags.add(tag));
  });
  return Array.from(tags).sort();
});
const selectedSkills = ref<string[]>([]);

const filteredExperiences = computed<TimelineItem[]>(() =>
  !selectedSkills.value.length
    ? props.experiences
    : props.experiences.filter((experience) =>
        selectedSkills.value.every(
          (tag: string) => experience.skills?.includes(tag),
        ),
      ),
);
</script>

<template>
  <h1 class="section-title">{{ $t('Timeline') }}</h1>

  <CommonFilters
    :available-tags="availableSkills"
    v-model:selected-tags="selectedSkills"
    :buttonText="$t('Filter by Skills')"
  />

  <v-timeline
    align="start"
    side="end"
    :density="isMobile ? 'compact' : 'default'"
  >
    <v-timeline-item
      v-for="experience in filteredExperiences"
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
              new Date(experience.end_date).getMonth() &&
            new Date(experience.start_date).getFullYear() !==
              new Date(experience.end_date).getFullYear()
              ? '-' + formatDate(new Date(experience.end_date))
              : ''
          }}
        </v-chip>
      </template>
      <template #default>
        <AboutTimelineContent
          :experience="experience"
          :is-mobile="isMobile"
          :selected-skills="selectedSkills"
        />
      </template>
    </v-timeline-item>
  </v-timeline>
</template>

<style scoped lang="scss"></style>
