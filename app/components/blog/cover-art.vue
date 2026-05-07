<script setup lang="ts">
import { useTheme } from '~/store/theme.store';

interface Props {
  cover: { hue: number; pattern: string };
  image?: string;
}

const props = defineProps<Props>();
const { isDark } = storeToRefs(useTheme());
</script>

<template>
  <div
    :class="
      image
        ? ['blog-cover-image']
        : ['blog-cover', `blog-cover--${cover.pattern}`, isDark ? 'blog-cover--dark' : 'blog-cover--light']
    "
    :style="!image ? { '--cover-hue': cover.hue, '--cover-hue-shift': cover.hue + 40, '--cover-hue-wide': cover.hue + 60 } : undefined"
    aria-hidden="true"
  >
    <template v-if="image">
      <img :src="image" alt="" class="blog-cover-image__img" />
    </template>
    <template v-else>
      <div class="blog-cover__glow" />
      <div class="blog-cover__grain" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.blog-cover {
  position: relative;
  width: 100%;
  overflow: hidden;

  &--dark {
    background:
      radial-gradient(
        120% 80% at 20% 0%,
        hsla(var(--cover-hue), 60%, 45%, 0.55),
        transparent 60%
      ),
      radial-gradient(
        100% 80% at 90% 100%,
        hsla(var(--cover-hue-shift), 70%, 40%, 0.45),
        transparent 60%
      ),
      linear-gradient(
        135deg,
        hsl(var(--cover-hue), 40%, 18%),
        hsl(var(--cover-hue-wide), 30%, 10%)
      );
  }

  &--light {
    background:
      radial-gradient(
        120% 80% at 20% 0%,
        hsla(var(--cover-hue), 70%, 82%, 0.85),
        transparent 60%
      ),
      radial-gradient(
        100% 80% at 90% 100%,
        hsla(var(--cover-hue-shift), 70%, 76%, 0.75),
        transparent 60%
      ),
      linear-gradient(
        135deg,
        hsl(var(--cover-hue), 40%, 92%),
        hsl(var(--cover-hue-wide), 30%, 86%)
      );
  }

  &__glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      60% 60% at 50% 40%,
      hsla(var(--cover-hue), 80%, 60%, 0.25),
      transparent 70%
    );
    mix-blend-mode: screen;
  }

  &__grain {
    position: absolute;
    inset: 0;
    opacity: 0.5;
  }

  &--diag &__grain {
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.03) 0 1px,
      transparent 1px 8px
    );
  }

  &--grid &__grain {
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  &--dots &__grain {
    background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1.2px);
    background-size: 14px 14px;
  }

  &--wave &__grain {
    background-image: repeating-radial-gradient(
      circle at 30% 120%,
      rgba(255, 255, 255, 0.06) 0 2px,
      transparent 2px 24px
    );
  }

  &--light &__grain {
    opacity: 0.4;
    filter: invert(1);
  }
}

.blog-cover-image {
  position: relative;
  width: 100%;
  overflow: hidden;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
</style>
