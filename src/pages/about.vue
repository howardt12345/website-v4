<script setup lang="ts">
const { data } = await useAsyncData('about-content', () =>
  queryContent('/about').findOne(),
);
console.log(data);
</script>

<template>
  <h1 class="section-title">{{ $t('About') }}</h1>
  <div class="about">
    <div class="about__content" v-if="data">
      <ContentRenderer class="content-renderer" :value="data" />
      <v-btn
        href="/resume.pdf"
        target="_blank"
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
    <div class="about__image">image</div>
  </div>
</template>

<style scoped lang="scss">
.about {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-bottom: rem(32);

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  &__image {
    width: 100%;
    max-width: 400px;
    margin-bottom: rem(16);
    border: 1px solid $border-color;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    margin-bottom: rem(16);

    &__image {
      max-width: 100%;
    }
  }
}

.content-renderer {
  :deep(p) {
    margin-bottom: rem(8);
  }
  :last-child {
    margin-bottom: 0;
  }
}

.resume-button {
  margin: rem(24);
}
</style>
