import type { RouterConfig } from '@nuxt/schema';

// Travel page encodes view state in the hash (e.g. #country/CAN, #trip/travel/trip-tw-2024/country/TWN).
// These are not DOM element anchors, so querySelector would throw on the invalid CSS selector.
// Wrap the lookup so valid anchors (like #about) still scroll while state-hashes are ignored.
export default {
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) {
      try {
        const el = document.querySelector(to.hash);
        if (el) return { el: to.hash, behavior: 'smooth' };
      } catch {
        return false;
      }
    }
    return { top: 0 };
  },
} satisfies RouterConfig;
