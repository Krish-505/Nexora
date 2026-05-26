import { TenantLifecycleEmailInput } from '../email.types';
import { renderEmailLayout } from './email-layout';

export const renderTenantDeactivatedEmail = (
  input: TenantLifecycleEmailInput,
) =>
  renderEmailLayout({
    eyebrow: input.tenant.tenantName,
    title: 'Workspace access deactivated',
    preview: `${input.tenant.tenantName} has been deactivated in Nexora.`,
    body: `
      <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">
        The <strong>${input.tenant.tenantName}</strong> workspace has been deactivated by a platform administrator.
      </p>
      <p style="margin:18px 0 0;color:#475569;font-size:14px;line-height:1.6;">
        Tenant users will be blocked from login, protected API access, and realtime socket authentication until the workspace is reactivated.
      </p>
    `,
  });
