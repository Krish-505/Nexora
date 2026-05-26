import { LowStockEmailInput } from '../email.types';
import { renderEmailLayout } from './email-layout';

export const renderLowStockAlertEmail = (input: LowStockEmailInput) => {
  const severityLabel =
    input.severity === 'critical' ? 'Critical stock warning' : 'Low stock warning';

  return renderEmailLayout({
    eyebrow: input.tenant.tenantName,
    title: severityLabel,
    preview: `${input.product.name} has ${input.product.stock} unit(s) remaining.`,
    body: `
      <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.6;">
        Inventory for <strong>${input.product.name}</strong> has fallen below the configured threshold.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin:20px 0;">
        <tr>
          <td style="padding:14px 16px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">Product</td>
          <td style="padding:14px 16px;color:#0f172a;font-size:14px;font-weight:700;">${input.product.name}</td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">Current stock</td>
          <td style="padding:14px 16px;color:#b45309;font-size:20px;font-weight:800;">${input.product.stock}</td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">Threshold</td>
          <td style="padding:14px 16px;color:#0f172a;font-size:14px;">Below ${input.threshold}</td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">Category</td>
          <td style="padding:14px 16px;color:#0f172a;font-size:14px;">${input.product.categoryName || 'Uncategorized'}</td>
        </tr>
      </table>
      <p style="margin:18px 0 0;color:#475569;font-size:14px;line-height:1.6;">
        Review inventory availability and replenish stock to avoid customer-facing availability issues.
      </p>
    `,
  });
};
