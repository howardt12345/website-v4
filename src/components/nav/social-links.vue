<script setup lang="ts">
import { useSocialLinks } from '@/composables/links';

const socialLinks = useSocialLinks();
</script>

<template>
  <div class="social-links">
    <div
      v-for="(link, index) in socialLinks"
      v-motion
      :key="link.name"
      :initial="{ y: 0 }"
    >
      <v-btn
        :href="link.path"
        target="_blank"
        rel="nofollow noopener noreferrer"
        variant="plain"
        :icon="`${link.icon}`"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.social-links {
  display: flex;
  flex-direction: row;
  height: rem(36);
}
</style>