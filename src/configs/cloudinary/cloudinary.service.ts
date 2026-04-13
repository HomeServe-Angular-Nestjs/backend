import { UploadApiResponse, v2 as Cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';
import { Inject, Injectable } from '@nestjs/common';
import { CLOUDINARY } from './cloudinary.provider';
import { UploadErrorCodes } from '@core/enum/error.enum';

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
          public_id,
          folder: 'homeserve',
          overwrite: true,
          type: 'authenticated',
          invalidate: true,
        },
        (err, result) => {

          if (err) {

            if (
              err?.code === 'ECONNRESET' ||
              err?.code === 'ETIMEDOUT' ||
              err?.code === 'EAI_AGAIN'
            ) {
              return reject(new Error(UploadErrorCodes.NETWORK_FAILURE));
            }

            if (err?.http_code) {
              return reject(new Error(UploadErrorCodes.UPLOAD_PROVIDER_ERROR));
            }

            return reject(new Error(UploadErrorCodes.UPLOAD_UNKNOWN_ERROR));
          }

          if (!result) {
            return reject(new Error(UploadErrorCodes.EMPTY_RESULT));
          }

          resolve(result);
        }
      );

      stream.on('error', () => {
        reject(new Error(UploadErrorCodes.UPLOAD_UNKNOWN_ERROR));
      });

      Readable.from(file.buffer).pipe(stream);
    });
  }

  async delete(publicId: string) {
    return await this._cloudinary.uploader.destroy(publicId);
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
