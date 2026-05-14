import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  const toasts = ref([])

  const removeToast = (id) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const pushToast = ({
    title,
    message,
    type = 'info',
    duration = 4000,
  }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    toasts.value = [
      ...toasts.value,
      {
        id,
        title,
        message,
        type,
      },
    ]

    window.setTimeout(() => {
      removeToast(id)
    }, duration)

    return id
  }

  const success = (message, title = 'Success') =>
    pushToast({ title, message, type: 'success' })

  const error = (message, title = 'Something went wrong') =>
    pushToast({ title, message, type: 'error', duration: 5000 })

  const info = (message, title = 'Notice') =>
    pushToast({ title, message, type: 'info' })

  return {
    toasts,
    removeToast,
    pushToast,
    success,
    error,
    info,
  }
})
