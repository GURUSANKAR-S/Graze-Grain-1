import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('categories')
  async findAllCategories() {
    return this.menuService.findAllCategories();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/categories')
  async findAllCategoriesAdmin() {
    return this.menuService.findAllCategoriesAdmin();
  }

  @Get('items')
  async findAllItems(
    @Query('categoryId', new DefaultValuePipe(0), ParseIntPipe)
    categoryId: number,
  ) {
    const items = await this.menuService.findAllItems(
      categoryId > 0 ? categoryId : undefined,
    );
    return items.map((item) => ({
      ...item,
      price: Number(item.price),
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/items')
  async findAllItemsAdmin() {
    const items = await this.menuService.findAllItemsAdmin();
    return items.map((item) => ({
      ...item,
      price: Number(item.price),
    }));
  }

  // Admin endpoints - protected
  @UseGuards(JwtAuthGuard)
  @Post('categories')
  async createCategory(
    @Body()
    createCategoryDto: {
      name: string;
      slug?: string;
      displayOrder?: number;
    },
  ) {
    return this.menuService.createCategory(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateCategoryDto: {
      name?: string;
      slug?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.menuService.updateCategory(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('categories/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteCategory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  async createMenuItem(
    @Body()
    createItemDto: {
      name: string;
      slug?: string;
      description?: string;
      price: number;
      imageUrl?: string;
      categoryId: number;
      isFeatured?: boolean;
    },
  ) {
    return this.menuService.createMenuItem(createItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('items/:id')
  async updateMenuItem(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateItemDto: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      categoryId?: number;
      isFeatured?: boolean;
      isAvailable?: boolean;
    },
  ) {
    return this.menuService.updateMenuItem(id, updateItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:id/availability')
  async toggleAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.toggleAvailability(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('items/:id')
  async deleteMenuItem(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteMenuItem(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats() {
    return this.menuService.getStats();
  }
}
