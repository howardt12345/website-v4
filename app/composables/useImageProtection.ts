export const useImageProtection = () => {
  const preventRightClick = (e: MouseEvent) => {
    const element = e.target as HTMLElement;
    if (element.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  onMounted(() => {
    document.addEventListener('contextmenu', preventRightClick);
  });

  onUnmounted(() => {
    document.removeEventListener('contextmenu', preventRightClick);
  });
};
