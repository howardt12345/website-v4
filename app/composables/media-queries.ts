import { useMediaQuery } from '@vueuse/core';

export const useMediaQueries = () => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const isTablet = useMediaQuery('(max-width: 900px)');
  const isNarrow = useMediaQuery('(max-width: 960px)');

  return { isMobile, isTablet, isNarrow };
};
