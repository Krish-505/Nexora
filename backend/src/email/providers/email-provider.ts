import { EmailMessage, EmailSendResult } from '../email.types';

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

export interface EmailProvider {
  sendEmail(message: EmailMessage): Promise<EmailSendResult>;
}
