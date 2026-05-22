import { DomainEventTypes } from './realtimeEvents'
import { useAuditStore } from '../stores/auditStore'
import { useAuthStore } from '../stores/authStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useDashboardStore } from '../stores/dashboardStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useProductStore } from '../stores/productStore'
import { useTenantStore } from '../stores/tenantStore'
import { useThemeStore } from '../stores/themeStore'

export const dispatchRealtimeEvent = (event) => {
  if (!event?.type) return

  useDashboardStore().applyRealtimeEvent(event)
  useNotificationStore().ingestDomainEvent(event)
  useProductStore().applyRealtimeEvent(event)
  useCategoryStore().applyRealtimeEvent(event)
  useTenantStore().applyRealtimeEvent(event)

  switch (event.type) {
    case DomainEventTypes.AUDIT_CREATED:
      useAuditStore().receiveRealtimeAuditLog(event.payload?.auditLog)
      break
    case DomainEventTypes.TENANT_THEME_UPDATED:
      useThemeStore().applyRealtimeThemeUpdate(event, useAuthStore().user)
      break
    default:
      break
  }
}
