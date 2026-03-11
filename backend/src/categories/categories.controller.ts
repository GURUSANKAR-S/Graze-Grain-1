import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { successResponse } from '../common/http/response.util';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getActiveCategories() {
    const data = await this.categoriesService.getActiveCategories();
    return successResponse(data);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async getAdminCategories() {
    const data = await this.categoriesService.getAdminCategories();
    return successResponse(data);
  }

  @Get(':id')
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoriesService.getCategoryWithMenuItems(id);
    return successResponse(data);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCategory(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.createCategory(dto);
    return successResponse(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.categoriesService.updateCategory(id, dto);
    return successResponse(data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoriesService.deleteCategory(id);
    return successResponse(data);
  }
}
