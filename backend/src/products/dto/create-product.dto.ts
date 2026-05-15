export class CreateProductDto {
  name: string;

  sku: string;

  categoryId: string;

  category?: string;

  stock: number;

  price: number;
}
