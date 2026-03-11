import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024,
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDest = process.env.UPLOAD_DEST || './uploads';
          mkdirSync(uploadDest, { recursive: true });
          cb(null, uploadDest);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!/^image\/(jpeg|png|webp)$/i.test(file.mimetype)) {
          return cb(
            new Error(
              'INVALID_FILE_TYPE: Only jpg, jpeg, png, webp are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService, MulterModule],
})
export class UploadModule {}
