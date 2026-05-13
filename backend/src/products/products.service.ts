import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { products } from '../database/memory-db';

@Injectable()
export class ProductsService {
  // GET PRODUCTS
  getProducts(user: any) {
    // SUPERADMIN
    if (user.role === 'superadmin') {
      return products;
    }

    // TENANT ADMIN
    return products.filter((product) => product.tenantId === user.tenantId);
  }

  // CREATE PRODUCT
  createProduct(user: any, body: any) {
    // SUPERADMIN CANNOT CREATE
    if (user.role === 'superadmin') {
      throw new ForbiddenException('Superadmin cannot create products');
    }

    const newProduct = {
      id: Date.now().toString(),

      name: body.name,

      price: body.price,

      tenantId: user.tenantId,
    };

    products.push(newProduct);

    return newProduct;
  }

  // DELETE PRODUCT
  deleteProduct(id: string, user: any) {
    const product = products.find((product) => product.id === id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // TENANT ISOLATION
    if (user.role !== 'superadmin' && product.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    const index = products.findIndex((product) => product.id === id);

    products.splice(index, 1);

    return {
      message: 'Product deleted successfully',
    };
  }
}
