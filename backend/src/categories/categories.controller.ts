import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  getCategories(@Req() req: any) {
    return this.categoriesService.getCategories(req.user);
  }

  @Post()
  createCategory(@Req() req: any, @Body() body: any) {
    return this.categoriesService.createCategory(req.user, body);
  }

  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    return this.categoriesService.updateCategory(id, req.user, body);
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.deleteCategory(id, req.user);
  }
}
