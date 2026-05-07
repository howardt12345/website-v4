<script setup lang="ts">
const progress = ref(0);

const syncProgress = () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.value = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
};

onMounted(() => {
  syncProgress();
  window.addEventListener('scroll', syncProgress, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', syncProgress);
});
</script>

<template>
  <div class="reading-progress" :style="{ transform: `scaleX(${progress})` }" />
</template>

<style scoped lang="scss">
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: $accent;
  z-index: 99;
  transform-origin: left;
  transition: transform 50ms linear;
}
</style>
