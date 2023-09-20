<script setup lang="ts">
import { TimelineItem } from '@/types/about';
import { usei18n } from '@/store/i18n.store';

interface Props {
  experiences: TimelineItem[];
}

const props = defineProps<Props>();
const { currentLanguage } = storeToRefs(usei18n());

const dateText = (date: Date) =>
  date.toLocaleDateString(currentLanguage.value, {
    year: 'numeric',
    month: 'short',
  });
</script>

<template>
  <h1 class="section-title">{{ $t('Timeline') }}</h1>
  <div class="timeline">
    <v-timeline align="start" side="end">
      <v-timeline-item
        v-for="experience in props.experiences"
        :key="experience.title"
        dot-color="primary"
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
  </div>
</template>

<style scoped lang="scss">
.timeline {
  margin: 0 auto;
  max-width: 1000px;
  padding: 0 20px;
  position: relative;
  width: 100%;
}

.timeline__container {
  margin: 0 auto;
  position: relative;
  width: 100%;
}

.timeline__line {
  background-color: var(--color-primary);
  height: 100%;
  left: 50%;
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  width: 2px;
}

.timeline__items {
  margin: 0 auto;
  position: relative;
  width: 100%;
}

:deep(.v-timeline-item__body) {
  width: 100%;
}
</style>
