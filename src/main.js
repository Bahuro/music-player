import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/scss/theme.scss'

// Create Pinia store
const pinia = createPinia()

// Create and mount the Vue application
const app = createApp(App)

// Use plugins
app.use(pinia)
app.use(router)

// Mount the app
app.mount('#app')