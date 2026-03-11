import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { toSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveCategories() {
    const categories = await this.prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            menuItems: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      display_order: category.displayOrder,
      is_active: category.isActive,
      item_count: category._count.menuItems,
      created_at: category.createdAt,
    }));
  }

  async getCategoryWithMenuItems(id: number) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found',
      });
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      display_order: category.displayOrder,
      is_active: category.isActive,
      created_at: category.createdAt,
      menu_items: category.menuItems.map((item) => ({
        id: item.id,
        category_id: item.categoryId,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: Number(item.price),
        image_url: item.imageUrl,
        is_available: item.isAvailable,
        is_featured: item.isFeatured,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      })),
    };
  }

  async getAdminCategories() {
    const categories = await this.prisma.menuCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      display_order: category.displayOrder,
      is_active: category.isActive,
      created_at: category.createdAt,
    }));
  }

  async createCategory(payload: CreateCategoryDto) {
    await this.ensureUniqueName(payload.name);
    const slug = await this.createUniqueSlug(payload.name);

    const category = await this.prisma.menuCategory.create({
      data: {
        name: payload.name.trim(),
        slug,
        displayOrder: payload.display_order,
      },
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      display_order: category.displayOrder,
      is_active: category.isActive,
      created_at: category.createdAt,
    };
  }

  async updateCategory(id: number, payload: UpdateCategoryDto) {
    const existing = await this.prisma.menuCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found',
      });
    }

    if (
      payload.name &&
      payload.name.trim().toLowerCase() !== existing.name.toLowerCase()
    ) {
      await this.ensureUniqueName(payload.name, id);
    }

    const updateData: {
      name?: string;
      slug?: string;
      displayOrder?: number;
      isActive?: boolean;
    } = {};

    if (payload.name) {
      updateData.name = payload.name.trim();
      updateData.slug = await this.createUniqueSlug(payload.name, id);
    }
    if (payload.display_order !== undefined) {
      updateData.displayOrder = payload.display_order;
    }
    if (payload.is_active !== undefined) {
      updateData.isActive = payload.is_active;
    }

    const category = await this.prisma.menuCategory.update({
      where: { id },
      data: updateData,
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      display_order: category.displayOrder,
      is_active: category.isActive,
      created_at: category.createdAt,
    };
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found',
      });
    }

    const activeItems = await this.prisma.menuItem.count({
      where: {
        categoryId: id,
        isDeleted: false,
        isAvailable: true,
      },
    });

    if (activeItems > 0) {
      throw new BadRequestException({
        code: 'CATEGORY_HAS_ACTIVE_ITEMS',
        message: 'Cannot deactivate category with active menu items',
      });
    }

    const updated = await this.prisma.menuCategory.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      display_order: updated.displayOrder,
      is_active: updated.isActive,
      created_at: updated.createdAt,
    };
  }

  private async ensureUniqueName(name: string, excludeId?: number) {
    const existing = await this.prisma.menuCategory.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new BadRequestException({
        code: 'CATEGORY_NAME_EXISTS',
        message: 'Category name must be unique',
      });
    }
  }

  private async createUniqueSlug(name: string, excludeId?: number) {
    const base = toSlug(name);
    let slug = base;
    let i = 1;

    // Keep deterministic unique slug generation when names collide.
    while (
      await this.prisma.menuCategory.findFirst({
        where: {
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      })
    ) {
      slug = `${base}-${i++}`;
    }

    return slug;
  }
}
