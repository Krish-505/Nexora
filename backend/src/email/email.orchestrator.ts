import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { tenants, users } from '../database/memory-db';
import { DomainEvent, DomainEventTypes } from '../realtime/domain-events';
import { RealtimeService } from '../realtime/realtime.service';
import { EmailRecipient, TenantEmailContext } from './email.types';
import { EmailService } from './email.service';

@Injectable()
export class EmailOrchestrator implements OnModuleInit {
  private readonly logger = new Logger(EmailOrchestrator.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly emailService: EmailService,
  ) {}

  onModuleInit() {
    this.realtimeService.subscribe((event) => {
      this.queueEmailWork(event);
    });
  }

  private queueEmailWork(event: DomainEvent) {
    void this.handleEvent(event).catch((error) => {
      const message = error instanceof Error ? error.message : 'Email event failed';
      this.logger.error(`${event.type}: ${message}`);
    });
  }

  private async handleEvent(event: DomainEvent) {
    switch (event.type) {
      case DomainEventTypes.LOW_STOCK_DETECTED:
        await this.handleLowStockDetected(event);
        break;
      case DomainEventTypes.TENANT_DEACTIVATED:
        await this.handleTenantDeactivated(event);
        break;
      case DomainEventTypes.TENANT_CREATED:
        await this.handleTenantCreated(event);
        break;
      case DomainEventTypes.USER_WELCOME:
        await this.handleUserWelcome(event);
        break;
      default:
        break;
    }
  }

  private async handleLowStockDetected(event: DomainEvent) {
    const payload = event.payload || {};
    const product = payload.product;

    if (!product) return;

    await this.emailService.sendLowStockAlert({
      recipients: this.tenantAdmins(event.tenantId),
      tenant: this.tenantContext(event.tenantId, payload.tenantName),
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        categoryName: product.categoryName,
        stock: Number(product.stock || 0),
      },
      threshold: Number(payload.threshold || 5),
      severity: payload.severity === 'critical' ? 'critical' : 'warning',
    });
  }

  private async handleTenantDeactivated(event: DomainEvent) {
    const tenant = event.payload?.tenant;
    const tenantId = event.tenantId || tenant?.id || null;

    await this.emailService.sendTenantDeactivated({
      recipients: this.tenantAdmins(tenantId),
      tenant: this.tenantContext(tenantId, tenant?.name),
    });
  }

  private async handleTenantCreated(event: DomainEvent) {
    const tenant = event.payload?.tenant;
    const tenantId = event.tenantId || tenant?.id || null;
    const tenantAdmin = users.find(
      (user) => user.tenantId === tenantId && user.role === 'tenant-admin',
    );

    await this.emailService.sendWelcomeEmail({
      recipients: tenantAdmin ? [this.toRecipient(tenantAdmin)] : [],
      tenant: this.tenantContext(tenantId, tenant?.name),
      loginEmail: tenantAdmin?.email,
    });
  }

  private async handleUserWelcome(event: DomainEvent) {
    const payload = event.payload || {};
    const recipient = payload.user?.email
      ? [{ email: payload.user.email }]
      : this.tenantAdmins(event.tenantId);

    await this.emailService.sendWelcomeEmail({
      recipients: recipient,
      tenant: this.tenantContext(event.tenantId, payload.tenantName),
      loginEmail: payload.user?.email,
    });
  }

  private tenantAdmins(tenantId: string | null): EmailRecipient[] {
    if (!tenantId) return [];

    return users
      .filter((user) => user.tenantId === tenantId && user.role === 'tenant-admin')
      .map((user) => this.toRecipient(user));
  }

  private toRecipient(user: any): EmailRecipient {
    return {
      email: user.email,
      name: user.email,
    };
  }

  private tenantContext(
    tenantId: string | null,
    tenantName?: string,
  ): TenantEmailContext {
    const tenant = tenantId
      ? tenants.find((entry) => entry.id === tenantId)
      : null;

    return {
      tenantId,
      tenantName: tenantName || tenant?.name || 'Nexora workspace',
    };
  }
}
