<script setup lang="ts">
import { instagramLink } from '@/composables/links';
import { ParsedContent } from '@nuxt/content/dist/runtime/types';

interface Props {
  data: ParsedContent;
}
const props = defineProps<Props>();
</script>

<template>
  <h1 class="section-title">{{ $t('About') }}</h1>
  <div class="about">
    <div class="about__content">
      <ContentRenderer class="content-renderer" :value="data" />
      <v-btn
        href="/resume.pdf"
        target="_blank"
        rel="nofollow noopener noreferrer"
        class="resume-button"
        size="large"
        color="primary"
        >{{ $t('Resume') }}</v-btn
      >
      <AboutSkills
        :technologies="data.technologies"
        :hobbies="data.hobbies"
        :languages="data.languages"
      />
    </div>
    <div class="about__image">
      <a
        :href="instagramLink"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        <v-img src="images/me.jpg"></v-img>
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.about {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-bottom: rem(32);

  @media (max-width: 600px) {
    flex-direction: column;
    margin-bottom: rem(16);
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 65%;

    @media (max-width: 600px) {
      width: 100%;
    }
  }

  &__image {
    position: relative;
    width: 35%;
    max-width: rem(300);
    margin-bottom: rem(16);
    border-radius: rem(4);
    margin-left: rem(60);

    @media (max-width: 600px) {
      width: 100%;
      margin-left: 0;
    }

    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: rem(4);
      transition: $transition;

      border: 2px solid $accent;
      top: 20px;
      left: 20px;
    }

    :deep(.v-img) {
      border-radius: rem(4);
      z-index: 2 !important;
    }

    :deep(img) {
      filter: grayscale(100%) contrast(1) !important;
      mix-blend-mode: multiply;
      transition: $transition;
    }

    &:hover,
    &:focus {
      :deep(img) {
        filter: none !important;
        mix-blend-mode: normal;
      }
      &:after {
        top: 15px;
        left: 15px;
      }
    }
  }
}

.resume-button {
  margin: rem(24);
}
</style>
