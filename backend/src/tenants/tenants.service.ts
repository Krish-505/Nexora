import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { categories, products, tenants, users } from '../database/memory-db';
import { AuditService } from '../audit/audit.service';
import {
  createDefaultTenantTheme,
  type TenantSidebarStyle,
  type TenantSurfaceStyle,
  type TenantTheme,
  type TenantThemeMode,
} from '../database/theme-defaults';
import { UpdateTenantThemeDto } from './dto/update-tenant-theme.dto';

const THEME_MODES: TenantThemeMode[] = ['light', 'dark'];
const SIDEBAR_STYLES: TenantSidebarStyle[] = ['glass', 'solid', 'minimal'];
const SURFACE_STYLES: TenantSurfaceStyle[] = ['elevated', 'soft', 'bordered'];
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

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

  private validateThemeUpdate(body: UpdateTenantThemeDto = {}): UpdateTenantThemeDto {
    const nextTheme: UpdateTenantThemeDto = {};

    if (body.primaryColor !== undefined) {
      if (!HEX_COLOR_PATTERN.test(body.primaryColor)) {
        throw new BadRequestException('Primary color must be a valid hex color');
      }

      nextTheme.primaryColor = body.primaryColor;
    }

    if (body.accentColor !== undefined) {
      if (!HEX_COLOR_PATTERN.test(body.accentColor)) {
        throw new BadRequestException('Accent color must be a valid hex color');
      }

      nextTheme.accentColor = body.accentColor;
    }

    if (body.mode !== undefined) {
      if (!THEME_MODES.includes(body.mode)) {
        throw new BadRequestException('Theme mode is not supported');
      }

      nextTheme.mode = body.mode;
    }

    if (body.sidebarStyle !== undefined) {
      if (!SIDEBAR_STYLES.includes(body.sidebarStyle)) {
        throw new BadRequestException('Sidebar style is not supported');
      }

      nextTheme.sidebarStyle = body.sidebarStyle;
    }

    if (body.surfaceStyle !== undefined) {
      if (!SURFACE_STYLES.includes(body.surfaceStyle)) {
        throw new BadRequestException('Surface style is not supported');
      }

      nextTheme.surfaceStyle = body.surfaceStyle;
    }

    if (body.logo !== undefined) {
      if (typeof body.logo !== 'string') {
        throw new BadRequestException('Logo must be a string');
      }

      nextTheme.logo = body.logo.trim();
    }

    return nextTheme;
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
      theme: createDefaultTenantTheme(),
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

  updateTenantTheme(id: string, body: UpdateTenantThemeDto = {}, user: any) {
    this.ensureSuperadmin(user);

    const tenant = tenants.find((entry) => entry.id === id);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const validThemeUpdate = this.validateThemeUpdate(body);
    const currentTheme = (tenant.theme || createDefaultTenantTheme()) as TenantTheme;

    tenant.theme = {
      ...currentTheme,
      ...validThemeUpdate,
    };

    this.auditService.logForUser(user, {
      action: 'TENANT_THEME_UPDATED',
      message: `Superadmin updated theme for tenant ${tenant.name}`,
      tenantId: tenant.id,
    });

    return tenant;
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
