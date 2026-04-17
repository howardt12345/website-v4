<script setup lang="ts">
import { useNavLinks, type NavLink } from '~/composables/links';
import { useActiveSection } from '~/composables/useActiveSection';

const HASH_SECTION_PREFIX = '/#';
const ANIMATE_ENTER_DURATION_MS = 500;
const LINK_STAGGER_MS = 150;

interface Props {
  animate?: boolean;
  delay?: number;
  iconOnly?: boolean;
}
const { animate = false, delay = 0, iconOnly = false } = defineProps<Props>();

const links = useNavLinks();
const route = useRoute();

const isHashSectionLink = (path: string) => path.startsWith(HASH_SECTION_PREFIX);
const sectionIdFromPath = (path: string) => path.slice(HASH_SECTION_PREFIX.length);

const { activeSection } = useActiveSection(['about', 'experience', 'projects', 'contact']);

const isLinkActive = (link: NavLink): boolean => {
  if (isHashSectionLink(link.path)) {
    return route.path === '/' && activeSection.value === sectionIdFromPath(link.path);
  }
  return route.path.startsWith(link.path);
};
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
          duration: animate ? ANIMATE_ENTER_DURATION_MS : 0,
          type: 'keyframes',
          ease: 'easeOut',
        },
      }"
      :delay="index * LINK_STAGGER_MS + delay"
    >
      <v-btn
        v-if="!iconOnly"
        nuxt
        :to="link.path"
        variant="plain"
        active-class=""
        exact-active-class=""
        class="nav-link-btn"
        :class="{ 'nav-link-active': isLinkActive(link) }"
      >
        {{ $t(link.name) }}
      </v-btn>
      <v-btn
        v-else
        nuxt
        :to="link.path"
        variant="plain"
        active-class=""
        exact-active-class=""
        :icon="`fas fa-${link.icon}`"
        :class="{ 'nav-link-active': isLinkActive(link) }"
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
  &.nav-link-active::after {
    transform: translateX(-50%) scaleX(1);
  }

  &.nav-link-active {
    color: $accent;
  }
}
</style>
