import { useMediaQuery } from '@vueuse/core';

export const useMediaQueries = () => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const isTablet = useMediaQuery('(max-width: 900px)');

  return { isMobile, isTablet };
};
