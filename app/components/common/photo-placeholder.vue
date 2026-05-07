<script setup lang="ts">
interface Props {
  hue: number;
  pattern?: string;
}

withDefaults(defineProps<Props>(), {
  pattern: 'diag',
});
</script>

<template>
  <div
    class="photo-placeholder"
    :class="`photo-placeholder--${pattern}`"
    :style="{ '--ph-hue': hue }"
    aria-hidden="true"
  >
    <div class="photo-placeholder__glow" />
    <div class="photo-placeholder__grain" />
  </div>
</template>

<style scoped lang="scss">
.photo-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .v-theme--dark & {
    background:
      radial-gradient(120% 80% at 20% 0%, hsl(var(--ph-hue) 60% 45% / 0.55), transparent 60%),
      radial-gradient(100% 80% at 90% 100%, hsl(calc(var(--ph-hue) + 40) 70% 40% / 0.45), transparent 60%),
      linear-gradient(135deg, hsl(var(--ph-hue) 40% 18%), hsl(calc(var(--ph-hue) + 60) 30% 10%));
  }

  .v-theme--light & {
    background:
      radial-gradient(120% 80% at 20% 0%, hsl(var(--ph-hue) 70% 82% / 0.85), transparent 60%),
      radial-gradient(100% 80% at 90% 100%, hsl(calc(var(--ph-hue) + 40) 70% 76% / 0.75), transparent 60%),
      linear-gradient(135deg, hsl(var(--ph-hue) 40% 92%), hsl(calc(var(--ph-hue) + 60) 30% 86%));
  }

  &__glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(60% 60% at 50% 40%, hsl(var(--ph-hue) 80% 60% / 0.25), transparent 70%);
    mix-blend-mode: screen;
  }

  &__grain {
    position: absolute;
    inset: 0;
    opacity: 0.5;

    .v-theme--light & {
      opacity: 0.4;
      filter: invert(1);
    }
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
}
</style>
