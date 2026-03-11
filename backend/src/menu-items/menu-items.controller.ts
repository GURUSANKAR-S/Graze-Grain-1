import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  FileTypeValidator,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { successResponse } from '../common/http/response.util';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsQueryDto } from './dto/menu-items-query.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Controller('menu-items')
export class MenuItemsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  async listItems(@Query() query: MenuItemsQueryDto) {
    const { items, meta } = await this.menuItemsService.listPublicItems(query);
    return successResponse(items, meta);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async listAdminItems(@Query() query: MenuItemsQueryDto) {
    const { items, meta } = await this.menuItemsService.listAdminItems(query);
    return successResponse(items, meta);
  }

  @Get('featured')
  async listFeaturedItems() {
    const data = await this.menuItemsService.getFeaturedItems();
    return successResponse(data);
  }

  @Get(':id')
  async getItemById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.menuItemsService.getItemById(id);
    return successResponse(data);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createItem(
    @Body() dto: CreateMenuItemDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    const imageUrl = image
      ? this.uploadService.toPublicImageUrl(image.filename)
      : undefined;
    const data = await this.menuItemsService.createItem(dto, imageUrl);
    return successResponse(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    const imageUrl = image
      ? this.uploadService.toPublicImageUrl(image.filename)
      : undefined;
    const data = await this.menuItemsService.updateItem(id, dto, imageUrl);
    return successResponse(data);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard)
  async setAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    const data = await this.menuItemsService.setAvailability(
      id,
      dto.is_available,
    );
    return successResponse(data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteItem(@Param('id', ParseIntPipe) id: number) {
    const data = await this.menuItemsService.softDelete(id);
    return successResponse(data);
  }
}
