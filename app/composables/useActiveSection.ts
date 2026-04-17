const STICKY_NAV_HEIGHT_PX = 60;
const ACTIVE_THRESHOLD_PERCENT = 60;

export const useActiveSection = (orderedSectionIds: string[]) => {
  const activeSection = ref<string | null>(null);

  onMounted(() => {
    const observers: IntersectionObserver[] = [];
    const intersecting = new Set<string>();

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

    onUnmounted(() => observers.forEach((o) => o.disconnect()));
  });

  return { activeSection };
};
