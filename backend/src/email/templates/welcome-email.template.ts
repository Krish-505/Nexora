import { WelcomeEmailInput } from '../email.types';
import { renderEmailLayout } from './email-layout';

export const renderWelcomeEmail = (input: WelcomeEmailInput) =>
  renderEmailLayout({
    eyebrow: input.tenant.tenantName,
    title: 'Welcome to Nexora',
    preview: `${input.tenant.tenantName} is ready in Nexora.`,
    body: `
      <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">
        Your Nexora workspace for <strong>${input.tenant.tenantName}</strong> has been provisioned.
      </p>
      <p style="margin:18px 0 0;color:#475569;font-size:14px;line-height:1.6;">
        Sign in with your tenant administrator account${input.loginEmail ? `: <strong>${input.loginEmail}</strong>` : ''}.
      </p>
      <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
        This is a placeholder welcome template. Future phases can add invitation links, password setup, tenant branding, and onboarding steps.
      </p>
    `,
  });
