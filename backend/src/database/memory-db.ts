import { createDefaultTenantTheme } from './theme-defaults';

export const tenants = [
  {
    id: 'tenant-1',

    name: 'Spotify',

    slug: 'spotify',

    active: true,

    theme: createDefaultTenantTheme(),

    createdAt: new Date(),
  },

  {
    id: 'tenant-2',

    name: 'Netflix',

    slug: 'netflix',

    active: true,

    theme: createDefaultTenantTheme(),

    createdAt: new Date(),
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

export const categories = [
  {
    id: 'category-1',
    name: 'Electronics',
    slug: 'electronics',
    tenantId: 'tenant-1',
    createdAt: new Date(),
  },
  {
    id: 'category-2',
    name: 'Mobile',
    slug: 'mobile',
    tenantId: 'tenant-1',
    createdAt: new Date(),
  },
  {
    id: 'category-3',
    name: 'Entertainment',
    slug: 'entertainment',
    tenantId: 'tenant-2',
    createdAt: new Date(),
  },
];

export const products = [
  {
    id: 'product-1',

    name: 'Spotify Laptop',

    sku: 'SP-LAP-001',

    categoryId: 'category-1',

    categoryName: 'Electronics',

    stock: 12,

    price: 50000,

    tenantId: 'tenant-1',
  },

  {
    id: 'product-2',

    name: 'Spotify Phone',

    sku: 'SP-PHN-001',

    categoryId: 'category-2',

    categoryName: 'Mobile',

    stock: 8,

    price: 30000,

    tenantId: 'tenant-1',
  },

  {
    id: 'product-3',

    name: 'Netflix TV',

    sku: 'NF-TV-001',

    categoryId: 'category-3',

    categoryName: 'Entertainment',

    stock: 5,

    price: 80000,

    tenantId: 'tenant-2',
  },
];

export const auditLogs: any[] = [];
