import { Inject, Injectable } from '@nestjs/common';
import { CLOUDINARY } from './cloudinary.provider';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof Cloudinary) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { folder: 'homeserve' },
        (err, result) => {
          if (err)
            return reject(err instanceof Error ? err : new Error(String(err)));
          if (!result) return reject(new Error('Upload failed'));
          return resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(stream);
    });
  }
}
