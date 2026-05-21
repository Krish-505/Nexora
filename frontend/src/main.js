import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { registerUnauthorizedHandler } from './services/apiClient'
import { useAuthStore } from './stores/authStore'
import { useNotificationStore } from './stores/notificationStore'
import { useSocketStore } from './stores/socketStore'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const socketStore = useSocketStore()

registerUnauthorizedHandler((message) => {
  const normalizedMessage =
    /tenant/i.test(message) && /(deactivated|inactive)/i.test(message)
      ? 'Tenant account has been deactivated'
      : message

  authStore.handleUnauthorized(normalizedMessage)
  notificationStore.error(normalizedMessage, 'Access revoked')

  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' })
  }
})

const bootstrap = async () => {
  await authStore.initAuth()
  socketStore.connect()

  app.use(router)
  await router.isReady()

  app.mount('#app')
}

bootstrap()
