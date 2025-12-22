<script setup lang="ts">
interface Props {
  isMobile?: boolean;
  isTablet?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="home-title">
    <div class="title-container">
      <h2
        :class="{
          overline: true,
          'overline--tablet': isTablet,
          'overline--mobile': isMobile,
        }"
      >
        {{ $t("Hi, I'm") }}
      </h2>
      <h1
        :class="{
          title: true,
          'title--tablet': isTablet,
          'title--mobile': isMobile,
        }"
      >
        {{ $t('HOWARD') }}
      </h1>
    </div>
    <hr class="line" />
    <div class="subtitle-container">
      <h2
        :class="{
          subtitle: true,
          'subtitle--tablet': isTablet,
          'subtitle--mobile': isMobile,
        }"
      >
        {{ $t('Freelance Photographer') }}
      </h2>
      <h2
        :class="{
          subtitle: true,
          'subtitle--tablet': isTablet,
          'subtitle--mobile': isMobile,
        }"
      >
        {{ $t('Full-Stack Developer') }}
      </h2>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-title {
  flex-direction: column;
  width: 800px;
  @media screen and (max-width: 1000px) {
    width: 80vw;
  }
  font-family: Poppins;
  margin: 1rem 0;

  .overline {
    text-align: left;
    font-size: rem(28);
    font-weight: 400;

    &--tablet {
      font-size: rem(24);
    }

    &--mobile {
      font-size: rem(20);
      text-align: center;
    }
  }

  .title {
    text-align: left;
    font-size: rem(120);
    font-weight: 400;
    line-height: 0.75;
    margin-left: rem(-8);

    &--tablet {
      font-size: rem(96);
    }

    &--mobile {
      font-size: rem(68);
      text-align: center;
    }
  }

  .line {
    background: $border-color;
    height: 4px;
    margin: 1.25rem 0;
  }

  .subtitle {
    text-align: right;
    font-size: rem(28);
    font-weight: 400;
    line-height: 1;

    &--tablet {
      font-size: rem(24);
    }

    &--mobile {
      font-size: rem(20);
      text-align: center;
    }
  }
}

@keyframes titleAnimation {
  0% {
    opacity: 0;
    transform: translateY(50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.title-container {
  opacity: 0;
  transform: translateY(50px);
  animation-name: titleAnimation;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
  animation-delay: 0.5s;
}

@keyframes subtitleAnimation {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.subtitle-container {
  opacity: 0;
  transform: translateY(-30px);
  animation-name: subtitleAnimation;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
  animation-delay: 0.75s;
}

@keyframes lineAnimation {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}

.line {
  opacity: 0;
  transform: scaleX(0);
  animation-name: lineAnimation;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}
</style>
