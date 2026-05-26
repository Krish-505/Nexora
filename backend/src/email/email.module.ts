import { Module } from '@nestjs/common';
import { EmailOrchestrator } from './email.orchestrator';
import { EmailService } from './email.service';
import { EMAIL_PROVIDER } from './providers/email-provider';
import { ResendEmailProvider } from './providers/resend-email.provider';

@Module({
  providers: [
    EmailOrchestrator,
    EmailService,
    ResendEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      useExisting: ResendEmailProvider,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
