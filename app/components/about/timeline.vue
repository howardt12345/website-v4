<script setup lang="ts">
import type { TimelineItem } from '~/types/about';
import { useMediaQueries } from '~/composables/media-queries';
import { getDateRangeLabel } from '~/composables/date';

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

const toggleSkill = (skill: string) => {
  selectedSkills.value = selectedSkills.value.includes(skill)
    ? selectedSkills.value.filter((s) => s !== skill)
    : [...selectedSkills.value, skill];
};
</script>

<template>
  <h2 class="section-title">{{ $t('Experience') }}</h2>

  <CommonFilters
    v-model:selected-tags="selectedSkills"
    class="timeline__filters"
    :available-tags="availableSkills"
    :button-text="$t('Filter by Skills')"
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
          {{ getDateRangeLabel(experience.start_date, experience.end_date) }}
        </v-chip>
      </template>
      <template #default>
        <AboutTimelineContent
          :experience
          :is-mobile
          :selected-skills
          @toggle-skill="toggleSkill"
        />
      </template>
    </v-timeline-item>
  </v-timeline>
</template>

<style scoped lang="scss">
.timeline {
  &__filters {
    margin-bottom: rem(16);
  }
}
</style>
