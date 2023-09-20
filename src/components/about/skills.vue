import { AboutListItems } from '#build/components'; import { text } from
'@fortawesome/fontawesome-svg-core';
<script setup lang="ts">
import { usei18n } from '@/store/i18n.store';

interface Props {
  technologies: string[];
  hobbies: string[];
  languages: { name: string; value: number }[];
}
const props = defineProps<Props>();

const { t } = usei18n();

const languageLevel = (value: number) => {
  if (value < 1) {
    return t('Beginner');
  } else if (value < 2) {
    return t('Elementary');
  } else if (value < 3) {
    return t('Conversational');
  } else if (value < 4) {
    return t('Intermediate');
  } else if (value < 5) {
    return t('Advanced');
  } else {
    return t('Fluent');
  }
};
</script>

<template>
  <div class="skills">
    <div>
      <h2 class="skills-title">{{ $t('Recent Technologies') }}</h2>
      <AboutListItems :items="technologies" grid />
    </div>
    <div class="skills-row">
      <div>
        <h2 class="skills-title">{{ $t('Hobbies') }}</h2>
        <AboutListItems :items="hobbies" />
      </div>
      <div>
        <h2 class="skills-title">{{ $t('Languages') }}</h2>
        <div v-for="{ name, value } in languages" class="language-item">
          <span class="language-item__text">{{ name }}</span>
          <v-slider
            :key="name"
            :model-value="value * 20"
            color="primary"
            track-color="gray"
            thumb-label
            readonly
            hide-details
          >
            <template #thumb-label>
              <span>{{ languageLevel(value) }}</span>
            </template>
          </v-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.skills {
  text-align: left;
  width: 100%;

  &-title {
    font-size: rem(28);
    margin-bottom: rem(8);
  }

  &-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;

    @media (max-width: 480px) {
      grid-template-columns: none;
    }
  }
}

.language-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  margin-bottom: rem(8);

  &__text {
    height: fit-content;
    align-self: center;
    font-size: rem(16);
  }
}
</style>
