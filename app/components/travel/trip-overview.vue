<script setup lang="ts">
import type { TravelTrip, TravelDay, TripOverviewDay } from '~/types/travel';
import type { LightboxEntry } from '~/types/ui';
import { formatDayLabel, dayUniqueCities } from '~/composables/travel';
import { useTravelStore } from '~/store/travel.store';
import { usei18n } from '~/store/i18n.store';

interface Props {
  trip?: TravelTrip;
  days: TripOverviewDay[];
}

const props = defineProps<Props>();
defineEmits<{ 'pick-day': [idx: number] }>();

const { cityById } = useTravelStore();
const { currentLanguage } = storeToRefs(usei18n());

const dayCityLabel = (day: TravelDay): string =>
  dayUniqueCities(day)
    .map((loc) => cityById(loc.country, loc.city)?.name ?? loc.city)
    .join(' → ');

const allLightboxPhotos = computed<LightboxEntry[]>(() =>
  props.days.flatMap((item) =>
    item.photos.map((entry) => ({
      src: entry.photo.url,
      alt: entry.photo.alt ?? entry.photo.title ?? entry.placeName,
      title: entry.photo.title,
      caption: entry.photo.caption,
      label: entry.placeName,
      tags: entry.photo.tags,
    })),
  ),
);

const dayOffsets = computed<number[]>(() => {
  let offset = 0;
  return props.days.map((item) => {
    const start = offset;
    offset += item.photos.length;
    return start;
  });
});

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(dayIdx: number, photoIdx: number) {
  lightboxIndex.value = (dayOffsets.value[dayIdx] ?? 0) + photoIdx;
  lightboxOpen.value = true;
}
</script>

<template>
  <div class="trip-overview">
    <div class="trip-overview__head">
      <div class="trip-overview__eyebrow">{{ $t('The whole trip') }}</div>
      <h2 class="trip-overview__title">{{ $t('All photos') }}</h2>
    </div>

    <div v-if="days.length" class="trip-overview__timeline">
      <section
        v-for="(item, dayIdx) in days"
        :key="item.day.date"
        class="overview-day"
      >
        <button
          type="button"
          class="overview-day__head"
          @click="$emit('pick-day', item.dayIndex)"
        >
          <span class="overview-day__dot" aria-hidden="true" />
          <span class="overview-day__labels">
            <span class="overview-day__date">{{ formatDayLabel(item.day.date, currentLanguage) }}</span>
            <span class="overview-day__city">{{ dayCityLabel(item.day) }}</span>
          </span>
          <span v-if="item.photos.length" class="overview-day__count">
            {{ item.photos.length }} {{ $t('photos') }}
          </span>
        </button>

        <ul v-if="!item.photos.length && item.day.places.length" class="overview-day__places">
          <li
            v-for="place in item.day.places"
            :key="place.id ?? place.name"
            class="overview-day__place"
          >
            {{ place.name }}
          </li>
        </ul>

        <div v-if="item.photos.length" class="overview-day__photos">
          <figure
            v-for="(entry, photoIdx) in item.photos"
            :key="entry.photo.url"
            class="overview-photo"
            @click="openLightbox(dayIdx, photoIdx)"
          >
            <v-img
              :src="entry.photo.url"
              :alt="entry.photo.alt ?? entry.photo.title ?? entry.placeName"
              :aspect-ratio="1"
              cover
              class="overview-photo__img"
            />
            <figcaption class="overview-photo__caption">{{ entry.placeName }}</figcaption>
          </figure>
        </div>
      </section>
    </div>

    <CommonPhotoLightbox
      v-model="lightboxOpen"
      :photos="allLightboxPhotos"
      :start-index="lightboxIndex"
    />
  </div>
</template>

<style scoped lang="scss">
.trip-overview {
  margin-top: rem(8);
}

.trip-overview__head {
  margin-bottom: rem(28);
}

.trip-overview__eyebrow {
  font-size: rem(11);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: $text-secondary;
  font-weight: 600;
  margin-bottom: rem(6);
  opacity: 0.7;
}

.trip-overview__title {
  font-size: rem(28);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 500;
  color: $text;
  margin: 0;
}

.trip-overview__timeline {
  position: relative;
  padding-left: rem(28);

  &::before {
    content: '';
    position: absolute;
    left: rem(7);
    top: rem(8);
    bottom: rem(8);
    width: 1px;
    background: $border-color;
  }
}

.overview-day {
  position: relative;
  margin-bottom: rem(44);

  &:last-child {
    margin-bottom: 0;
  }
}

.overview-day__head {
  display: flex;
  align-items: baseline;
  gap: rem(14);
  width: 100%;
  margin-bottom: rem(16);
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  text-align: left;
  position: relative;
  transition: $transition-fast;

  &:hover {
    .overview-day__city {
      color: $accent;
    }
    .overview-day__dot {
      background: $accent;
    }
  }
}

.overview-day__dot {
  position: absolute;
  left: rem(-28);
  top: rem(6);
  width: rem(11);
  height: rem(11);
  border-radius: 50%;
  background: rgb(var(--v-theme-background));
  border: 2px solid $accent;
  flex-shrink: 0;
  transition: $transition-fast;
}

.overview-day__labels {
  display: flex;
  flex-direction: column;
  gap: rem(2);
}

.overview-day__date {
  font-size: rem(11);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: $text-secondary;
  font-weight: 600;
  opacity: 0.7;
}

.overview-day__city {
  font-size: rem(18);
  font-weight: 500;
  color: $text;
  line-height: 1.25;
  transition: $transition-fast;
}

.overview-day__count {
  margin-left: auto;
  font-size: rem(11);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: $text-secondary;
  opacity: 0.6;
  white-space: nowrap;
}

.overview-day__places {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: rem(6);
}

.overview-day__place {
  font-size: rem(11);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: $text-secondary;
  opacity: 0.65;
  padding: rem(4) rem(10);
  border: 1px solid $border-color;
  border-radius: rem(20);
  white-space: nowrap;
}

.overview-day__photos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: rem(10);

  @media (max-width: 960px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.overview-photo {
  margin: 0;
  cursor: pointer;

  &__img {
    border-radius: rem(8);
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.88;
    }
  }

  &__caption {
    font-size: rem(10);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $text-secondary;
    opacity: 0.65;
    margin-top: rem(5);
  }
}

</style>
