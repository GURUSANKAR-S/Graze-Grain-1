import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findAllCategories() {
    return this.prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findAllCategoriesAdmin() {
    return this.prisma.menuCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findAllItems(categoryId?: number) {
    return this.prisma.menuItem.findMany({
      where: {
        isDeleted: false,
        isAvailable: true,
        ...(categoryId && { categoryId }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllItemsAdmin() {
    return this.prisma.menuItem.findMany({
      where: {
        isDeleted: false, // Exclude deleted items for admin as well
      },
      orderBy: { name: 'asc' },
    });
  }

  // Admin CRUD operations
  async createCategory(data: {
    name: string;
    slug?: string;
    displayOrder?: number;
  }) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');
    return this.prisma.menuCategory.create({
      data: {
        name: data.name,
        slug,
        displayOrder: data.displayOrder || 0,
      },
    });
  }

  async updateCategory(
    id: number,
    data: {
      name?: string;
      slug?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.menuCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: number) {
    // Check if category has items
    const itemsCount = await this.prisma.menuItem.count({
      where: { categoryId: id, isDeleted: false },
    });

    if (itemsCount > 0) {
      // Soft delete by setting isActive to false
      return this.prisma.menuCategory.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.menuCategory.delete({
      where: { id },
    });
  }

  async createMenuItem(data: {
    name: string;
    slug?: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: number;
    isFeatured?: boolean;
  }) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');
    return this.prisma.menuItem.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price as any,
        imageUrl: data.imageUrl || '/placeholder.jpg',
        categoryId: data.categoryId,
        isFeatured: data.isFeatured || false,
      },
    });
  }

  async updateMenuItem(
    id: number,
    data: {
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
    const updateData: any = { ...data };

    return this.prisma.menuItem.update({
      where: { id },
      data: updateData,
    });
  }

  async toggleAvailability(id: number) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable },
    });
  }

  async deleteMenuItem(id: number) {
    return this.prisma.menuItem.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async getStats() {
    const [totalItems, activeCategories, featuredItems] = await Promise.all([
      this.prisma.menuItem.count({ where: { isDeleted: false } }),
      this.prisma.menuCategory.count({ where: { isActive: true } }),
      this.prisma.menuItem.count({
        where: { isDeleted: false, isFeatured: true },
      }),
    ]);

    return {
      totalItems,
      activeCategories,
      featuredItems,
    };
  }
}
