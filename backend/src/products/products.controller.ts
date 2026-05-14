import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { CreateProductDto } from './dto/create-product.dto';

import { ProductsService } from './products.service';

import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getProducts(@Req() req: any) {
    return this.productsService.getProducts(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createProduct(
    @Req() req: any,

    @Body()
    body: CreateProductDto,
  ) {
    return this.productsService.createProduct(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteProduct(
    @Param('id') id: string,

    @Req() req: any,
  ) {
    return this.productsService.deleteProduct(id, req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateProduct(
    @Param('id') id: string,

    @Body()
    body: UpdateProductDto,

    @Req() req: any,
  ) {
    return this.productsService.updateProduct(id, body, req.user);
  }
}
