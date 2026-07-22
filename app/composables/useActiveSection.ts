const STICKY_NAV_HEIGHT_PX = 60;
const ACTIVE_THRESHOLD_PERCENT = 60;

export const useActiveSection = (orderedSectionIds: string[]) => {
  const activeSection = ref<string | null>(null);
  const route = useRoute();

  let observers: IntersectionObserver[] = [];
  const intersecting = new Set<string>();

  const disconnect = () => {
    observers.forEach((o) => o.disconnect());
    observers = [];
    intersecting.clear();
    activeSection.value = null;
  };

  // The header lives in the persistent layout, so its observers outlive each page; re-query on nav.
  const observeSections = () => {
    disconnect();
    for (const id of orderedSectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]!;
          if (entry.isIntersecting) {
            intersecting.add(id);
          } else {
            intersecting.delete(id);
          }
          activeSection.value = orderedSectionIds.find((s) => intersecting.has(s)) ?? null;
        },
        {
          rootMargin: `-${STICKY_NAV_HEIGHT_PX}px 0px -${ACTIVE_THRESHOLD_PERCENT}% 0px`,
          threshold: 0,
        },
      );

      observer.observe(el);
      observers.push(observer);
    }
  };

  onMounted(observeSections);
  watch(() => route.path, () => nextTick(observeSections));
  onUnmounted(disconnect);

  return { activeSection };
};
