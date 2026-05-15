import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { categories, products } from '../database/memory-db';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ProductsService {
  constructor(private auditService: AuditService) {}

  private resolveCategoryForProduct(user: any, body: any, currentTenantId: string) {
    const category = body.categoryId
      ? categories.find((entry) => entry.id === body.categoryId)
      : categories.find(
          (entry) =>
            entry.tenantId === currentTenantId &&
            entry.name.toLowerCase() === body.category?.trim()?.toLowerCase(),
        );

    if (!category) {
      throw new BadRequestException('Category is required');
    }

    if (category.tenantId !== currentTenantId) {
      throw new ForbiddenException('Category does not belong to this tenant');
    }

    if (user.role !== 'superadmin' && category.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return category;
  }

  // ─── GET PRODUCTS ─────────────────────
  getProducts(user: any) {
    // SUPERADMIN
    if (user.role === 'superadmin') {
      return products;
    }

    // TENANT ADMIN
    return products.filter((product) => product.tenantId === user.tenantId);
  }

  // ─── CREATE PRODUCT ───────────────────
  createProduct(user: any, body: any) {
    if (user.role === 'superadmin') {
      throw new ForbiddenException('Superadmin cannot create products');
    }

    const category = this.resolveCategoryForProduct(user, body, user.tenantId);

    const newProduct = {
      id: Date.now().toString(),

      name: body.name,

      sku: body.sku,

      categoryId: category.id,

      categoryName: category.name,

      stock: body.stock,

      price: body.price,

      tenantId: user.tenantId,
    };

    products.unshift(newProduct);

    this.auditService.logForUser(user, {
      action: 'PRODUCT_CREATED',
      message: `Tenant admin created product ${newProduct.name}`,
      tenantId: newProduct.tenantId,
    });

    return newProduct;
  }

  // ─── UPDATE PRODUCT ───────────────────
  updateProduct(id: string, body: any, user: any) {
    const product = products.find((product) => product.id === id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // TENANT SECURITY
    if (user.role !== 'superadmin' && product.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const category =
      body.categoryId || body.category
        ? this.resolveCategoryForProduct(user, body, product.tenantId)
        : null;

    Object.assign(product, {
      ...body,
      ...(category
        ? {
            categoryId: category.id,
            categoryName: category.name,
          }
        : {}),
    });

    delete (product as any).category;

    this.auditService.logForUser(user, {
      action: 'PRODUCT_UPDATED',
      message: `${user.role === 'superadmin' ? 'Superadmin' : 'Tenant admin'} updated product ${
        product.name
      }`,
      tenantId: product.tenantId,
    });

    return product;
  }

  // ─── DELETE PRODUCT ───────────────────
  deleteProduct(id: string, user: any) {
    const product = products.find((product) => product.id === id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // TENANT SECURITY
    if (user.role !== 'superadmin' && product.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const index = products.findIndex((product) => product.id === id);

    products.splice(index, 1);

    this.auditService.logForUser(user, {
      action: 'PRODUCT_DELETED',
      message: `${user.role === 'superadmin' ? 'Superadmin' : 'Tenant admin'} deleted product ${
        product.name
      }`,
      tenantId: product.tenantId,
    });

    return {
      message: 'Product deleted successfully',
    };
  }
}
