export const DomainEventTypes = {
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',
  CATEGORY_DELETED: 'CATEGORY_DELETED',
  TENANT_CREATED: 'TENANT_CREATED',
  TENANT_DEACTIVATED: 'TENANT_DEACTIVATED',
  TENANT_ACTIVATED: 'TENANT_ACTIVATED',
  TENANT_DELETED: 'TENANT_DELETED',
  TENANT_THEME_UPDATED: 'TENANT_THEME_UPDATED',
  LOW_STOCK_DETECTED: 'LOW_STOCK_DETECTED',
  USER_WELCOME: 'USER_WELCOME',
  AUDIT_CREATED: 'AUDIT_CREATED',
  DASHBOARD_UPDATED: 'DASHBOARD_UPDATED',
} as const;

export type DomainEventType =
  (typeof DomainEventTypes)[keyof typeof DomainEventTypes];

export type DomainEventActor = {
  userId?: string | null;
  email?: string;
  role?: string;
};

export type DomainEvent<TPayload = any> = {
  type: DomainEventType;
  tenantId: string | null;
  actor: DomainEventActor | null;
  timestamp: string;
  payload: TPayload;
};
