const ACCENT = '#2196F3';
const ACCENT_dark = '#64ffda';
const DARK_BG = '#EBEBEB';
const DARK_BG_dark = '#1E1E1E';
const BG = '#FFFFFF';
const BG_dark = '#111111';
const SURFACE_dark = '#181818';

export const theme_light = {
  dark: false,
  colors: {
    background: BG,
    surface: BG,
    'surface-variant': DARK_BG,
    'surface-bright': '#F8F8F8',
    primary: ACCENT,
    'on-primary': '#FFFFFF',
    'text-primary': '#0A0A0A',
    'text-secondary': '#6B7280',
    'text-body': '#1A1A1A',
    'translucent-accent': 'rgba(33, 150, 243, 0.08)',
    shadow_bg: 'rgba(0, 0, 0, 0.04)',
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
    surface: SURFACE_dark,
    'surface-variant': DARK_BG_dark,
    'surface-bright': '#242424',
    background_secondary: DARK_BG_dark,
    primary: ACCENT_dark,
    'on-primary': '#003D30',
    'text-primary': '#F0F0F0',
    'text-secondary': '#9CA3AF',
    'text-body': '#E0E0E0',
    'translucent-accent': 'rgba(100, 255, 218, 0.08)',
    shadow_bg: 'rgba(0, 0, 0, 0.3)',
    error: '#CF6679',
    info: '#64B5F6',
    success: '#66BB6A',
    warning: '#FFA726',
  },
};
