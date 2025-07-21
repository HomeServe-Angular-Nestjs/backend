import { Inject, Injectable } from '@nestjs/common';
import { CLOUDINARY } from './cloudinary.provider';
import { v2 as Cloudinary, ResourceApiResponse, UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private _cloudinary: typeof Cloudinary) { }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this._cloudinary.uploader.upload_stream(
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

  async uploadsImage(file: Express.Multer.File, public_id: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this._cloudinary.uploader.upload_stream(
        {
          public_id: public_id,
          folder: 'homeserve',
          overwrite: true,
          type: 'authenticated'
        },
        (err, result) => {
          if (err) return reject(err instanceof Error ? err : new Error(String(err)));
          if (!result) return reject(new Error('Upload failed'));
          return resolve(result);
        }
      );

      Readable.from(file.buffer).pipe(stream);
    });
  }

  generateSignedUrl(publicId: string, expiresIn = 300): string {
    return this._cloudinary.url(publicId, {
      type: 'authenticated',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    });
  }
}
