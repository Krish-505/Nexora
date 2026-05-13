import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// ─── Restore session before first navigation ───────────────────────────────
// This lets the router guards and MainLayout see a hydrated user immediately.
const authStore = useAuthStore()
authStore.initAuth().finally(() => {
  app.mount('#app')
})