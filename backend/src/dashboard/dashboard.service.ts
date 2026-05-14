import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { products, tenants, users } from '../database/memory-db';

@Injectable()
export class DashboardService {
  getSuperadminStats(user: any) {
    if (user.role !== 'superadmin') {
      throw new ForbiddenException('Access denied');
    }

    return {
      totalTenants: tenants.length,
      activeTenants: tenants.filter((tenant) => tenant.active).length,
      inactiveTenants: tenants.filter((tenant) => !tenant.active).length,
      totalProducts: products.length,
      totalTenantAdmins: users.filter((entry) => entry.role === 'tenant-admin')
        .length,
      totalUsers: users.length,
    };
  }

  getTenantStats(user: any) {
    if (user.role !== 'tenant-admin') {
      throw new ForbiddenException('Access denied');
    }

    const tenant = tenants.find((entry) => entry.id === user.tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const tenantProducts = products.filter(
      (product) => product.tenantId === user.tenantId,
    );

    return {
      totalProducts: tenantProducts.length,
      activeProducts: tenantProducts.filter((product) => product.stock > 0)
        .length,
      lowStockProducts: tenantProducts.filter((product) => product.stock < 5)
        .length,
      totalInventoryValue: tenantProducts.reduce(
        (total, product) => total + product.price * product.stock,
        0,
      ),
      tenantName: tenant.name,
    };
  }
}
