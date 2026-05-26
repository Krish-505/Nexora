import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  LowStockEmailInput,
  TenantLifecycleEmailInput,
  WelcomeEmailInput,
} from './email.types';
import { EMAIL_PROVIDER } from './providers/email-provider';
import type { EmailProvider } from './providers/email-provider';
import { renderLowStockAlertEmail } from './templates/low-stock-alert.template';
import { renderTenantDeactivatedEmail } from './templates/tenant-deactivated.template';
import { renderWelcomeEmail } from './templates/welcome-email.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly provider: EmailProvider,
  ) {}

  async sendLowStockAlert(input: LowStockEmailInput) {
    if (!input.recipients.length) {
      this.logger.warn(`No low-stock email recipients for ${input.tenant.tenantId}`);
      return null;
    }

    return this.provider.sendEmail({
      to: input.recipients,
      subject: `[${input.tenant.tenantName}] Low stock: ${input.product.name}`,
      html: renderLowStockAlertEmail(input),
      text: `${input.product.name} has ${input.product.stock} unit(s) remaining. Threshold: below ${input.threshold}.`,
      tags: {
        type: 'low-stock-alert',
        tenantId: input.tenant.tenantId || 'platform',
      },
    });
  }

  async sendTenantDeactivated(input: TenantLifecycleEmailInput) {
    if (!input.recipients.length) {
      this.logger.warn(
        `No tenant deactivation email recipients for ${input.tenant.tenantId}`,
      );
      return null;
    }

    return this.provider.sendEmail({
      to: input.recipients,
      subject: `[${input.tenant.tenantName}] Workspace deactivated`,
      html: renderTenantDeactivatedEmail(input),
      text: `${input.tenant.tenantName} has been deactivated in Nexora.`,
      tags: {
        type: 'tenant-deactivated',
        tenantId: input.tenant.tenantId || 'platform',
      },
    });
  }

  async sendWelcomeEmail(input: WelcomeEmailInput) {
    if (!input.recipients.length) {
      this.logger.warn(`No welcome email recipients for ${input.tenant.tenantId}`);
      return null;
    }

    return this.provider.sendEmail({
      to: input.recipients,
      subject: `Welcome to Nexora, ${input.tenant.tenantName}`,
      html: renderWelcomeEmail(input),
      text: `${input.tenant.tenantName} is ready in Nexora.`,
      tags: {
        type: 'welcome',
        tenantId: input.tenant.tenantId || 'platform',
      },
    });
  }
}
