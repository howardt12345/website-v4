export const hslToHex = (h: number, s: number, l: number): string => {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const chroma = sNorm * Math.min(lNorm, 1 - lNorm);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return lNorm - chroma * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return '#' + toHex(channel(0)) + toHex(channel(8)) + toHex(channel(4));
};

export const vuetifyColorToHex = (cssVar: string): string => {
  const rgb = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar).trim().split(',').map(Number);
  return '#' + rgb.map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');
};
