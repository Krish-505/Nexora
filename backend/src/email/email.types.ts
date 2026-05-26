export type EmailRecipient = {
  email: string;
  name?: string;
};

export type EmailMessage = {
  to: EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  tags?: Record<string, string>;
};

export type EmailSendResult = {
  provider: string;
  id?: string;
  skipped?: boolean;
};

export type TenantEmailContext = {
  tenantId: string | null;
  tenantName: string;
};

export type LowStockEmailInput = {
  recipients: EmailRecipient[];
  tenant: TenantEmailContext;
  product: {
    id: string;
    name: string;
    sku?: string;
    categoryName?: string;
    stock: number;
  };
  threshold: number;
  severity: 'warning' | 'critical';
};

export type TenantLifecycleEmailInput = {
  recipients: EmailRecipient[];
  tenant: TenantEmailContext;
};

export type WelcomeEmailInput = {
  recipients: EmailRecipient[];
  tenant: TenantEmailContext;
  loginEmail?: string;
};
