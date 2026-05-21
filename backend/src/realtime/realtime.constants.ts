export const REALTIME_NAMESPACE = '/realtime';
export const REALTIME_DOMAIN_EVENT = 'DOMAIN_EVENT';
export const REALTIME_ROOMS = {
  platform: 'platform',
  tenant: (tenantId: string) => `tenant:${tenantId}`,
  role: (role: string) => `role:${role}`,
  user: (userId: string) => `user:${userId}`,
};
