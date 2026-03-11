import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { successResponse } from '../common/http/response.util';
import { UploadService } from './upload.service';
import { Response } from 'express';
import { existsSync } from 'fs';

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return successResponse({
      image_url: this.uploadService.toPublicImageUrl(file.filename),
    });
  }

  @Get('uploads/:filename')
  serveImage(@Param('filename') filename: string, @Res() res: Response) {
    if (!this.uploadService.isSafeFilename(filename)) {
      throw new BadRequestException({
        code: 'INVALID_FILE_NAME',
        message: 'Invalid filename',
      });
    }

    const absolutePath = this.uploadService.getAbsolutePath(filename);
    if (!existsSync(absolutePath)) {
      throw new NotFoundException({
        code: 'FILE_NOT_FOUND',
        message: 'File not found',
      });
    }

    return res.sendFile(absolutePath);
  }
}
