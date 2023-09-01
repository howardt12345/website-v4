const ACCENT = '#2196F3'
const ACCENT_dark = '#64ffda'
const DARK_BG = '#EAEAEA'
const DARK_BG_dark = '#202020'
const BG = '#FFFFFF'
const BG_dark = '#121212'

const theme_light = {
  dark: false,
  colors: {
    background: BG,
    surface: BG,
    'surface-variant': DARK_BG,
    primary: ACCENT,
    textPrimary: '#000000',
    textSecondary: '#7A7A7A',
    textBody: '#0C0C0C',
    translucent_accent: 'rgba(33, 150, 243, 0.07)',
    shadow_bg: 'rgba(234, 234, 234, 0.07)',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00'
  }
}

const theme_dark = {
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
    warning: '#FB8C00'
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  rootDir: 'src/',
  css: ['@/assets/scss/global.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/_vars.scss" as *;'
        }
      }
    }
  },
  modules: ['nuxt-3-vuetify'],
  // @ts-ignore
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'dark',
        options: {
          customProperties: true
        },
        themes: {
          light: theme_light,
          dark: theme_dark
        }
      }
    }
  }
})
