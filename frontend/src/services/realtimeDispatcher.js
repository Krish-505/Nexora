import { DomainEventTypes } from './realtimeEvents'
import { useAuditStore } from '../stores/auditStore'
import { useDashboardStore } from '../stores/dashboardStore'
import { useNotificationStore } from '../stores/notificationStore'

export const dispatchRealtimeEvent = (event) => {
  if (!event?.type) return

  useDashboardStore().applyRealtimeEvent(event)
  useNotificationStore().ingestDomainEvent(event)

  switch (event.type) {
    case DomainEventTypes.AUDIT_CREATED:
      useAuditStore().receiveRealtimeAuditLog(event.payload?.auditLog)
      break
    default:
      break
  }
}
