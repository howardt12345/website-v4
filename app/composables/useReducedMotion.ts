import { useMediaQuery } from '@vueuse/core';

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
