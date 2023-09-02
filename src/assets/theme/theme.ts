const ACCENT = '#2196F3';
const ACCENT_dark = '#64ffda';
const DARK_BG = '#EAEAEA';
const DARK_BG_dark = '#202020';
const BG = '#FFFFFF';
const BG_dark = '#121212';

export const theme_light = {
  dark: false,
  colors: {
    background: BG,
    surface: BG,
    'surface-variant': DARK_BG,
    primary: ACCENT,
    'text-primary': '#000000',
    'text-secondary': '#7A7A7A',
    'text-body': '#0C0C0C',
    'translucent-accent': 'rgba(33, 150, 243, 0.07)',
    shadow_bg: 'rgba(234, 234, 234, 0.07)',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
};

export const theme_dark = {
  dark: true,
  colors: {
    background: BG_dark,
    background_secondary: DARK_BG_dark,
    primary: ACCENT_dark,
    'text-primary': '#FFFFFF',
    'text-secondary': '#858585',
    'text-body': '#F3F3F3',
    'translucent-accent': 'rgba(100, 255, 218, 0.07)',
    shadow_bg: 'rgba(21, 21, 21, 0.07)',
    error: '#CF6679',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
};
