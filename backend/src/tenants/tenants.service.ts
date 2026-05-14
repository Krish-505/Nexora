import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { tenants } from '../database/memory-db';

@Injectable()
export class TenantsService {
  // ─── GET TENANTS ──────────────────────
  getTenants(user: any) {
    if (user.role !== 'superadmin') {
      throw new ForbiddenException('Access denied');
    }

    return tenants;
  }

  // ─── CREATE TENANT ────────────────────
  createTenant(body: any, user: any) {
    if (user.role !== 'superadmin') {
      throw new ForbiddenException('Access denied');
    }

    const newTenant = {
      id: Date.now().toString(),

      name: body.name,

      slug: body.slug,

      active: true,

      createdAt: new Date(),
    };

    tenants.unshift(newTenant);

    return newTenant;
  }

  // ─── TOGGLE ACTIVE STATUS ─────────────
  toggleTenant(id: string, user: any) {
    if (user.role !== 'superadmin') {
      throw new ForbiddenException('Access denied');
    }

    const tenant = tenants.find((tenant) => tenant.id === id);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.active = !tenant.active;

    return tenant;
  }
}
