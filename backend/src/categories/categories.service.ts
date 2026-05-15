import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import { categories, products } from '../database/memory-db';

@Injectable()
export class CategoriesService {
  constructor(private auditService: AuditService) {}

  private normalizeSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private ensureTenantAdmin(user: any) {
    if (user.role !== 'tenant-admin') {
      throw new ForbiddenException('Only tenant admins can manage categories');
    }
  }

  private findCategoryForUser(id: string, user: any) {
    const category = categories.find((entry) => entry.id === id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (user.role !== 'superadmin' && category.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return category;
  }

  getCategories(user: any) {
    if (user.role === 'superadmin') {
      return categories;
    }

    return categories.filter((category) => category.tenantId === user.tenantId);
  }

  createCategory(user: any, body: any) {
    this.ensureTenantAdmin(user);

    const name = body.name?.trim();

    if (!name) {
      throw new BadRequestException('Category name is required');
    }

    const slug = this.normalizeSlug(body.slug || name);

    if (!slug) {
      throw new BadRequestException('Category slug is required');
    }

    const duplicate = categories.some(
      (category) =>
        category.tenantId === user.tenantId && category.slug === slug,
    );

    if (duplicate) {
      throw new BadRequestException('Category slug already exists');
    }

    const category = {
      id: `category-${Date.now()}`,
      name,
      slug,
      tenantId: user.tenantId,
      createdAt: new Date(),
    };

    categories.unshift(category);

    this.auditService.logForUser(user, {
      action: 'CATEGORY_CREATED',
      message: `Tenant admin created category ${category.name}`,
      tenantId: category.tenantId,
    });

    return category;
  }

  updateCategory(id: string, user: any, body: any) {
    this.ensureTenantAdmin(user);

    const category = this.findCategoryForUser(id, user);
    const name = body.name?.trim();
    const slug = this.normalizeSlug(body.slug || name || category.name);

    if (!name) {
      throw new BadRequestException('Category name is required');
    }

    const duplicate = categories.some(
      (entry) =>
        entry.id !== id &&
        entry.tenantId === user.tenantId &&
        entry.slug === slug,
    );

    if (duplicate) {
      throw new BadRequestException('Category slug already exists');
    }

    category.name = name;
    category.slug = slug;

    products
      .filter((product) => product.categoryId === category.id)
      .forEach((product) => {
        product.categoryName = category.name;
      });

    this.auditService.logForUser(user, {
      action: 'CATEGORY_UPDATED',
      message: `Tenant admin updated category ${category.name}`,
      tenantId: category.tenantId,
    });

    return category;
  }

  deleteCategory(id: string, user: any) {
    this.ensureTenantAdmin(user);

    const category = this.findCategoryForUser(id, user);
    const isInUse = products.some((product) => product.categoryId === id);

    if (isInUse) {
      throw new BadRequestException(
        'Cannot delete category with existing products',
      );
    }

    const index = categories.findIndex((entry) => entry.id === id);
    categories.splice(index, 1);

    this.auditService.logForUser(user, {
      action: 'CATEGORY_DELETED',
      message: `Tenant admin deleted category ${category.name}`,
      tenantId: category.tenantId,
    });

    return {
      message: 'Category deleted successfully',
    };
  }
}
