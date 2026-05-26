import { Injectable, Logger } from '@nestjs/common';
import { EmailMessage, EmailSendResult } from '../email.types';
import { EmailProvider } from './email-provider';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly apiKey = process.env.RESEND_API_KEY || '';
  private readonly defaultFrom =
    process.env.EMAIL_FROM || 'Nexora Alerts <alerts@nexora.local>';

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.apiKey) {
      this.logger.warn(
        `RESEND_API_KEY is not configured. Skipping email "${message.subject}".`,
      );

      return {
        provider: 'resend',
        skipped: true,
      };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: message.from || this.defaultFrom,
        to: message.to.map((recipient) => recipient.email),
        subject: message.subject,
        html: message.html,
        text: message.text,
        tags: message.tags
          ? Object.entries(message.tags).map(([name, value]) => ({ name, value }))
          : undefined,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { id?: string };

    if (!response.ok) {
      throw new Error(`Resend email failed with status ${response.status}`);
    }

    return {
      provider: 'resend',
      id: data.id,
    };
  }
}
