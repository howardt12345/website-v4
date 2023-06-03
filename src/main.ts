import './assets/sass/style.scss'
import PoppinsRegular from './assets/fonts/Poppins-Regular.ttf'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
