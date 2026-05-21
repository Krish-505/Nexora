import { DomainEventTypes } from './realtimeEvents'
import { useAuditStore } from '../stores/auditStore'
import { useAuthStore } from '../stores/authStore'
import { useDashboardStore } from '../stores/dashboardStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useTenantStore } from '../stores/tenantStore'
import { useThemeStore } from '../stores/themeStore'

export const dispatchRealtimeEvent = (event) => {
  if (!event?.type) return

  useDashboardStore().applyRealtimeEvent(event)
  useNotificationStore().ingestDomainEvent(event)

  switch (event.type) {
    case DomainEventTypes.AUDIT_CREATED:
      useAuditStore().receiveRealtimeAuditLog(event.payload?.auditLog)
      break
    case DomainEventTypes.TENANT_THEME_UPDATED:
      useTenantStore().applyRealtimeThemeUpdate(event)
      useThemeStore().applyRealtimeThemeUpdate(event, useAuthStore().user)
      break
    default:
      break
  }
}
