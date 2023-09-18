<script setup lang="ts">
import { useNavLinks } from '@/composables/links';

interface Props {
  animate?: boolean;
  delay?: number;
  isMobile?: boolean;
}
const props = defineProps<Props>();

const links = useNavLinks();
</script>

<template>
  <div class="nav-links">
    <div
      v-for="(link, index) in links"
      v-motion
      :key="link.name"
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
}
</style>
