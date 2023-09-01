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
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        options: {
            customProperties: true,
        },
        themes: {
          light: {
            colors: {
              background: '#FFFFFF',
              surface: '#FFFFFF',
              'surface-variant': '#424242',
              'on-surface-variant': '#EEEEEE',
              primary: '#6200EE',
              'primary-darken-1': '#3700B3',
              secondary: '#03DAC6',
              'secondary-darken-1': '#018786',
              error: '#B00020',
              info: '#2196F3',
              success: '#4CAF50',
              warning: '#FB8C00'
            },
            dark: false,
            variables: {
              'border-color': '#000000',
              'border-opacity': 0.12,
              'high-emphasis-opacity': 0.87,
              'medium-emphasis-opacity': 0.6,
              'disabled-opacity': 0.38,
              'idle-opacity': 0.04,
              'hover-opacity': 0.04,
              'focus-opacity': 0.12,
              'selected-opacity': 0.08,
              'activated-opacity': 0.12,
              'pressed-opacity': 0.12,
              'dragged-opacity': 0.08,
              'theme-kbd': '#212529',
              'theme-on-kbd': '#FFFFFF',
              'theme-code': '#F5F5F5',
              'theme-on-code': '#000000',
              'my-color-value': '#81df3a'
            }
          },
          dark: {
            colors: {
              background: '#121212',
              surface: '#212121',
              'surface-variant': '#BDBDBD',
              'on-surface-variant': '#424242',
              primary: '#BB86FC',
              'primary-darken-1': '#3700B3',
              secondary: '#03DAC5',
              'secondary-darken-1': '#03DAC5',
              error: '#CF6679',
              info: '#2196F3',
              success: '#4CAF50',
              warning: '#FB8C00'
            },
            dark: true,
            variables: {
              'border-color': '#FFFFFF',
              'border-opacity': 0.12,
              'high-emphasis-opacity': 1,
              'medium-emphasis-opacity': 0.7,
              'disabled-opacity': 0.5,
              'idle-opacity': 0.1,
              'hover-opacity': 0.04,
              'focus-opacity': 0.12,
              'selected-opacity': 0.08,
              'activated-opacity': 0.12,
              'pressed-opacity': 0.16,
              'dragged-opacity': 0.08,
              'theme-kbd': '#212529',
              'theme-on-kbd': '#FFFFFF',
              'theme-code': '#343434',
              'theme-on-code': '#CCCCCC',
              'my-color-value': '#81df3a'
            }
          }
        }
      }
    }
  }
})
