import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { categories, products, tenants, users } from '../database/memory-db';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TenantsService {
  constructor(private auditService: AuditService) {}

  private ensureSuperadmin(user: any) {
    if (user.role !== 'superadmin') {
      throw new ForbiddenException('Access denied');
    }
  }

  private normalizeSlug(slug: string) {
    return slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getTenants(user: any) {
    this.ensureSuperadmin(user);

    return tenants;
  }

  createTenant(body: any, user: any) {
    this.ensureSuperadmin(user);

    const name = body.name?.trim();
    const slug = this.normalizeSlug(body.slug || '');

    if (!name) {
      throw new BadRequestException('Tenant name is required');
    }

    if (!slug) {
      throw new BadRequestException('Tenant slug is required');
    }

    if (tenants.some((tenant) => tenant.slug === slug)) {
      throw new BadRequestException('Tenant slug already exists');
    }

    const adminEmail = `admin@${slug}.com`;

    if (users.some((entry) => entry.email === adminEmail)) {
      throw new BadRequestException('Tenant admin email already exists');
    }

    const timestamp = Date.now();
    const newTenant = {
      id: `tenant-${timestamp}`,
      name,
      slug,
      active: true,
      createdAt: new Date(),
    };

    const tenantAdmin = {
      id: `tenant-admin-${timestamp}`,
      email: adminEmail,
      password: '123456',
      role: 'tenant-admin',
      tenantId: newTenant.id,
    };

    tenants.unshift(newTenant);
    users.unshift(tenantAdmin);

    this.auditService.logForUser(user, {
      action: 'TENANT_CREATED',
      message: `Superadmin created tenant ${newTenant.name}`,
      tenantId: newTenant.id,
    });

    return {
      tenant: newTenant,
      adminCredentials: {
        email: tenantAdmin.email,
        password: tenantAdmin.password,
      },
    };
  }

  toggleTenant(id: string, user: any) {
    this.ensureSuperadmin(user);

    const tenant = tenants.find((entry) => entry.id === id);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.active = !tenant.active;

    this.auditService.logForUser(user, {
      action: tenant.active ? 'TENANT_ACTIVATED' : 'TENANT_DEACTIVATED',
      message: `Tenant ${tenant.name} was ${
        tenant.active ? 'activated' : 'deactivated'
      }`,
      tenantId: tenant.id,
    });

    return tenant;
  }

  deleteTenant(id: string, user: any) {
    this.ensureSuperadmin(user);

    const tenantIndex = tenants.findIndex((tenant) => tenant.id === id);

    if (tenantIndex === -1) {
      throw new NotFoundException('Tenant not found');
    }

    const deletedTenant = tenants[tenantIndex];
    tenants.splice(tenantIndex, 1);

    let deletedProducts = 0;
    for (let index = products.length - 1; index >= 0; index -= 1) {
      if (products[index].tenantId === id) {
        products.splice(index, 1);
        deletedProducts += 1;
      }
    }

    for (let index = categories.length - 1; index >= 0; index -= 1) {
      if (categories[index].tenantId === id) {
        categories.splice(index, 1);
      }
    }

    let deletedUsers = 0;
    for (let index = users.length - 1; index >= 0; index -= 1) {
      if (users[index].tenantId === id) {
        users.splice(index, 1);
        deletedUsers += 1;
      }
    }

    this.auditService.logForUser(user, {
      action: 'TENANT_DELETED',
      message: `Superadmin deleted tenant ${deletedTenant.name}`,
      tenantId: deletedTenant.id,
    });

    return {
      message: 'Tenant deleted successfully',
      tenant: deletedTenant,
      deletedProducts,
      deletedUsers,
    };
  }
}
