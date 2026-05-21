import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const severityByEventType = {
  PRODUCT_CREATED: 'success',
  PRODUCT_UPDATED: 'info',
  PRODUCT_DELETED: 'warning',
  CATEGORY_CREATED: 'success',
  CATEGORY_UPDATED: 'info',
  CATEGORY_DELETED: 'warning',
  TENANT_CREATED: 'success',
  TENANT_ACTIVATED: 'success',
  TENANT_DEACTIVATED: 'warning',
  TENANT_DELETED: 'error',
  TENANT_THEME_UPDATED: 'info',
  DASHBOARD_UPDATED: 'info',
}

const titleByEventType = {
  PRODUCT_CREATED: 'Product created',
  PRODUCT_UPDATED: 'Product updated',
  PRODUCT_DELETED: 'Product deleted',
  CATEGORY_CREATED: 'Category created',
  CATEGORY_UPDATED: 'Category updated',
  CATEGORY_DELETED: 'Category deleted',
  TENANT_CREATED: 'Tenant created',
  TENANT_ACTIVATED: 'Tenant activated',
  TENANT_DEACTIVATED: 'Tenant deactivated',
  TENANT_DELETED: 'Tenant deleted',
  TENANT_THEME_UPDATED: 'Theme updated',
  DASHBOARD_UPDATED: 'Dashboard updated',
}

const messageFromEvent = (event) => {
  const payload = event?.payload || {}
  const entity =
    payload.product?.name ||
    payload.category?.name ||
    payload.tenant?.name ||
    payload.auditLog?.message ||
    'Workspace activity'

  return typeof entity === 'string' ? entity : 'Workspace activity'
}

export const useNotificationStore = defineStore('notifications', () => {
  const toasts = ref([])
  const notifications = ref([])

  const unreadCount = computed(
    () => notifications.value.filter((notification) => !notification.read).length
  )

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

  const addNotification = ({
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type = 'SYSTEM',
    severity = 'info',
    title = 'Notification',
    message = '',
    tenantId = null,
    createdAt = new Date().toISOString(),
    read = false,
    toast = true,
  }) => {
    const notification = {
      id,
      type,
      severity,
      title,
      message,
      tenantId,
      createdAt,
      read,
    }

    if (notifications.value.some((entry) => entry.id === notification.id)) {
      return notification.id
    }

    notifications.value = [notification, ...notifications.value].slice(0, 100)

    if (toast) {
      pushToast({
        title,
        message,
        type: severity,
        duration: severity === 'error' ? 6000 : 4200,
      })
    }

    return notification.id
  }

  const ingestDomainEvent = (event) => {
    if (!event?.type || event.type === 'AUDIT_CREATED') return

    addNotification({
      id: `${event.type}-${event.timestamp}-${event.tenantId || 'platform'}`,
      type: event.type,
      severity: severityByEventType[event.type] || 'info',
      title: titleByEventType[event.type] || 'Realtime update',
      message: messageFromEvent(event),
      tenantId: event.tenantId,
      createdAt: event.timestamp || new Date().toISOString(),
    })
  }

  const markAsRead = (id) => {
    notifications.value = notifications.value.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    )
  }

  const markAllAsRead = () => {
    notifications.value = notifications.value.map((notification) => ({
      ...notification,
      read: true,
    }))
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const success = (message, title = 'Success') =>
    pushToast({ title, message, type: 'success' })

  const error = (message, title = 'Something went wrong') =>
    pushToast({ title, message, type: 'error', duration: 5000 })

  const info = (message, title = 'Notice') =>
    pushToast({ title, message, type: 'info' })

  const warning = (message, title = 'Warning') =>
    pushToast({ title, message, type: 'warning', duration: 5000 })

  return {
    toasts,
    notifications,
    unreadCount,
    removeToast,
    pushToast,
    addNotification,
    ingestDomainEvent,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    success,
    error,
    info,
    warning,
  }
})
