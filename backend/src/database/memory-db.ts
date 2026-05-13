export const tenants = [
  {
    id: 'tenant-1',
    name: 'Spotify',
    status: 'active',
  },
  {
    id: 'tenant-2',
    name: 'Netflix',
    status: 'active',
  },
];

export const users = [
  {
    id: 'superadmin-1',
    email: 'superadmin@nexora.com',
    password: '123456',
    role: 'superadmin',
    tenantId: null,
  },

  {
    id: 'tenant-admin-1',
    email: 'admin@spotify.com',
    password: '123456',
    role: 'tenant-admin',
    tenantId: 'tenant-1',
  },
  {
    id: 'tenant-admin-2',
    email: 'admin@netflix.com',
    password: '123456',
    role: 'tenant-admin',
    tenantId: 'tenant-2',
  },
];

export const products = [
  {
    id: 'product-1',
    name: 'Spotify Laptop',
    price: 50000,
    tenantId: 'tenant-1',
  },

  {
    id: 'product-2',
    name: 'Spotify Phone',
    price: 30000,
    tenantId: 'tenant-1',
  },

  {
    id: 'product-3',
    name: 'Netflix TV',
    price: 80000,
    tenantId: 'tenant-2',
  },
];
