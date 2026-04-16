<script setup lang="ts">
import { useNavLinks } from '~/composables/links';

interface Props {
  animate?: boolean;
  delay?: number;
  isMobile?: boolean;
}
defineProps<Props>();

const links = useNavLinks();
</script>

<template>
  <div class="nav-links">
    <div
      v-for="(link, index) in links"
      :key="link.name"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{
        opacity: 1,
        y: 0,
        transition: {
          duration: animate ? 500 : 0,
          type: 'keyframes',
          ease: 'easeOut',
        },
      }"
      :delay="index * 150 + (delay ?? 0)"
    >
      <v-btn
        v-if="!isMobile"
        nuxt
        :to="link.path"
        variant="plain"
        class="nav-link-btn"
        >{{ $t(link.name) }}
      </v-btn>
      <v-btn
        v-else
        nuxt
        :to="link.path"
        variant="plain"
        :icon="`fas fa-${link.icon}`"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.nav-links {
  display: flex;
  flex-direction: row;
  height: rem(36);
  gap: rem(4);
}

.nav-link-btn {
  position: relative;
  transition: color $transition-fast;

  &::after {
    content: '';
    position: absolute;
    bottom: rem(4);
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 60%;
    height: 2px;
    background: $accent;
    border-radius: 1px;
    transition: transform 0.2s ease;
  }

  &:hover::after,
  &.router-link-active::after {
    transform: translateX(-50%) scaleX(1);
  }

  &.router-link-active {
    color: $accent;
  }
}

.v-btn.router-link-active {
  color: $accent;
}
</style>
