import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';
import { DomainEvent } from './domain-events';
import { REALTIME_DOMAIN_EVENT, REALTIME_ROOMS } from './realtime.constants';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
  }

  emitToTenant(event: DomainEvent) {
    if (!event.tenantId) {
      this.broadcastPlatformEvent(event);
      return;
    }

    this.emitToRoom(REALTIME_ROOMS.tenant(event.tenantId), event);
    this.emitToRoom(REALTIME_ROOMS.platform, event);
  }

  emitToRole(role: string, event: DomainEvent) {
    this.emitToRoom(REALTIME_ROOMS.role(role), event);
  }

  emitToUser(userId: string, event: DomainEvent) {
    this.emitToRoom(REALTIME_ROOMS.user(userId), event);
  }

  broadcastPlatformEvent(event: DomainEvent) {
    this.emitToRoom(REALTIME_ROOMS.platform, event);
  }

  private emitToRoom(room: string, event: DomainEvent) {
    if (!this.server) {
      this.logger.warn(`Realtime server unavailable for ${event.type}`);
      return;
    }

    this.server.to(room).emit(REALTIME_DOMAIN_EVENT, event);
  }
}
