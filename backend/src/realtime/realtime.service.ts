import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';
import { DomainEvent } from './domain-events';
import { REALTIME_DOMAIN_EVENT, REALTIME_ROOMS } from './realtime.constants';

type DomainEventHandler = (event: DomainEvent) => void | Promise<void>;

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;
  private readonly domainEventHandlers = new Set<DomainEventHandler>();

  bindServer(server: Server) {
    this.server = server;
  }

  subscribe(handler: DomainEventHandler) {
    this.domainEventHandlers.add(handler);

    return () => {
      this.domainEventHandlers.delete(handler);
    };
  }

  emitToTenant(event: DomainEvent) {
    this.publishDomainEvent(event);

    if (!event.tenantId) {
      this.emitToRoom(REALTIME_ROOMS.platform, event);
      return;
    }

    this.emitToRoom(REALTIME_ROOMS.tenant(event.tenantId), event);
    this.emitToRoom(REALTIME_ROOMS.platform, event);
  }

  emitToRole(role: string, event: DomainEvent) {
    this.publishDomainEvent(event);
    this.emitToRoom(REALTIME_ROOMS.role(role), event);
  }

  emitToUser(userId: string, event: DomainEvent) {
    this.publishDomainEvent(event);
    this.emitToRoom(REALTIME_ROOMS.user(userId), event);
  }

  broadcastPlatformEvent(event: DomainEvent) {
    this.publishDomainEvent(event);
    this.emitToRoom(REALTIME_ROOMS.platform, event);
  }

  private publishDomainEvent(event: DomainEvent) {
    this.domainEventHandlers.forEach((handler) => {
      void Promise.resolve(handler(event)).catch((error) => {
        const message =
          error instanceof Error ? error.message : 'Domain event handler failed';

        this.logger.error(`${event.type} handler failed: ${message}`);
      });
    });
  }

  private emitToRoom(room: string, event: DomainEvent) {
    if (!this.server) {
      this.logger.warn(`Realtime server unavailable for ${event.type}`);
      return;
    }

    this.server.to(room).emit(REALTIME_DOMAIN_EVENT, event);
  }
}
