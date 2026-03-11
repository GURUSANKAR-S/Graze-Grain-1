import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class UploadService {
  toPublicImageUrl(filename: string) {
    return `/uploads/${filename}`;
  }

  getUploadRoot() {
    return process.env.UPLOAD_DEST || 'uploads';
  }

  getAbsolutePath(filename: string) {
    return join(process.cwd(), this.getUploadRoot(), filename);
  }

  isSafeFilename(filename: string) {
    return /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(filename);
  }
}
