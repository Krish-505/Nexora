import { ForbiddenException, Injectable } from '@nestjs/common';

import { auditLogs, users } from '../database/memory-db';
import { DomainEventTypes } from '../realtime/domain-events';
import { RealtimeService } from '../realtime/realtime.service';

type AuditLogInput = {
  action: string;
  message: string;
  performedBy: string;
  role: string;
  tenantId: string | null;
};

type AuditLogForUserInput = {
  action: string;
  message: string;
  tenantId?: string | null;
};

type AuditFilters = {
  action?: string;
  role?: string;
  tenantId?: string;
};

@Injectable()
export class AuditService {
  constructor(private readonly realtimeService: RealtimeService) {}

  log(input: AuditLogInput) {
    const auditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action: input.action,
      message: input.message,
      performedBy: input.performedBy,
      role: input.role,
      tenantId: input.tenantId,
      timestamp: new Date(),
    };

    auditLogs.unshift(auditLog);
    this.realtimeService.emitToTenant({
      type: DomainEventTypes.AUDIT_CREATED,
      tenantId: auditLog.tenantId,
      actor: {
        email: auditLog.performedBy,
        role: auditLog.role,
      },
      timestamp: new Date(auditLog.timestamp).toISOString(),
      payload: {
        auditLog,
      },
    });

    return auditLog;
  }

  logForUser(userPayload: any, input: AuditLogForUserInput) {
    const actor = users.find((user) => user.id === userPayload.userId);

    return this.log({
      action: input.action,
      message: input.message,
      performedBy: actor?.email || userPayload.userId || 'Unknown user',
      role: actor?.role || userPayload.role,
      tenantId:
        input.tenantId === undefined
          ? actor?.tenantId || userPayload.tenantId || null
          : input.tenantId,
    });
  }

  getLogs(userPayload: any, filters: AuditFilters) {
    let scopedLogs = [...auditLogs];

    if (userPayload.role === 'tenant-admin') {
      scopedLogs = scopedLogs.filter(
        (log) => log.tenantId === userPayload.tenantId,
      );
    } else if (userPayload.role !== 'superadmin') {
      throw new ForbiddenException('Access denied');
    }

    if (filters.action) {
      scopedLogs = scopedLogs.filter((log) => log.action === filters.action);
    }

    if (filters.role) {
      scopedLogs = scopedLogs.filter((log) => log.role === filters.role);
    }

    if (filters.tenantId && userPayload.role === 'superadmin') {
      scopedLogs = scopedLogs.filter(
        (log) => log.tenantId === filters.tenantId,
      );
    }

    return scopedLogs.sort(
      (first, second) =>
        new Date(second.timestamp).getTime() -
        new Date(first.timestamp).getTime(),
    );
  }
}
