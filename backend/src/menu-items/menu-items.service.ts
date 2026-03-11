import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuItemsQueryDto } from './dto/menu-items-query.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { toSlug } from '../common/utils/slug.util';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicItems(query: MenuItemsQueryDto) {
    const where = this.buildWhere(query, false);

    const orderBy = this.buildOrderBy(query.sort_by, query.order);
    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapItem(item)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async listAdminItems(query: MenuItemsQueryDto) {
    const where = this.buildWhere(query, true);
    const orderBy = this.buildOrderBy(query.sort_by, query.order);

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapItem(item)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async getFeaturedItems() {
    const items = await this.prisma.menuItem.findMany({
      where: {
        isDeleted: false,
        isFeatured: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 6,
      include: { category: true },
    });

    return items.map((item) => this.mapItem(item));
  }

  async getItemById(id: number) {
    const item = await this.prisma.menuItem.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        category: true,
      },
    });

    if (!item) {
      throw new NotFoundException({
        code: 'ITEM_NOT_FOUND',
        message: 'Menu item not found',
      });
    }

    return this.mapItem(item);
  }

  async createItem(dto: CreateMenuItemDto, imageUrl?: string) {
    await this.assertCategoryExists(dto.category_id);
    const slug = await this.createUniqueSlug(dto.name);

    const item = await this.prisma.menuItem.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description,
        price: dto.price as any,
        categoryId: dto.category_id,
        imageUrl: imageUrl || '',
        isAvailable: dto.is_available ?? true,
        isFeatured: dto.is_featured ?? false,
      },
      include: {
        category: true,
      },
    });

    return this.mapItem(item);
  }

  async updateItem(id: number, dto: UpdateMenuItemDto, imageUrl?: string) {
    const existing = await this.prisma.menuItem.findUnique({
      where: { id },
    });
    if (!existing || existing.isDeleted) {
      throw new NotFoundException({
        code: 'ITEM_NOT_FOUND',
        message: 'Menu item not found',
      });
    }

    if (dto.category_id) {
      await this.assertCategoryExists(dto.category_id);
    }

    const data: any = {};
    if (dto.name) {
      data.name = dto.name.trim();
      data.slug = await this.createUniqueSlug(dto.name, id);
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.price !== undefined) {
      data.price = dto.price as any;
    }
    if (dto.category_id !== undefined) {
      data.category = { connect: { id: dto.category_id } };
    }
    if (dto.is_available !== undefined) {
      data.isAvailable = dto.is_available;
    }
    if (dto.is_featured !== undefined) {
      data.isFeatured = dto.is_featured;
    }
    if (imageUrl) {
      data.imageUrl = imageUrl;
    }

    const item = await this.prisma.menuItem.update({
      where: { id },
      data,
      include: { category: true },
    });

    return this.mapItem(item);
  }

  async setAvailability(id: number, isAvailable: boolean) {
    const existing = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw new NotFoundException({
        code: 'ITEM_NOT_FOUND',
        message: 'Menu item not found',
      });
    }

    const item = await this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
      include: { category: true },
    });

    return this.mapItem(item);
  }

  async softDelete(id: number) {
    const existing = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw new NotFoundException({
        code: 'ITEM_NOT_FOUND',
        message: 'Menu item not found',
      });
    }

    const item = await this.prisma.menuItem.update({
      where: { id },
      data: { isDeleted: true },
      include: { category: true },
    });

    return this.mapItem(item);
  }

  private buildWhere(query: MenuItemsQueryDto, includeDeleted: boolean): any {
    const where: any = {
      ...(includeDeleted ? {} : { isDeleted: false }),
    };

    if (query.category_id) {
      where.categoryId = query.category_id;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.is_available !== undefined) {
      where.isAvailable = query.is_available === 'true';
    }

    return where;
  }

  private buildOrderBy(
    sortBy: 'price' | 'created_at',
    order: 'asc' | 'desc',
  ): any {
    if (sortBy === 'price') {
      return { price: order };
    }

    return { createdAt: order };
  }

  private async assertCategoryExists(categoryId: number) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException({
        code: 'INVALID_CATEGORY',
        message: 'Invalid category_id',
      });
    }
  }

  private async createUniqueSlug(name: string, excludeId?: number) {
    const base = toSlug(name);
    let slug = base;
    let i = 1;

    while (
      await this.prisma.menuItem.findFirst({
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

  private mapItem(item: {
    id: number;
    categoryId: number;
    name: string;
    slug: string;
    description: string | null;
    price: any;
    imageUrl: string;
    isAvailable: boolean;
    isFeatured: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    category?: {
      id: number;
      name: string;
      slug: string;
      displayOrder: number;
      isActive: boolean;
    } | null;
  }) {
    return {
      id: item.id,
      category_id: item.categoryId,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: Number(item.price),
      image_url: item.imageUrl,
      is_available: item.isAvailable,
      is_featured: item.isFeatured,
      is_deleted: item.isDeleted,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      category: item.category
        ? {
            id: item.category.id,
            name: item.category.name,
            slug: item.category.slug,
            display_order: item.category.displayOrder,
            is_active: item.category.isActive,
          }
        : null,
    };
  }
}
