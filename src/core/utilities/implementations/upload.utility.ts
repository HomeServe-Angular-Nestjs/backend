import { UploadApiResponse } from 'cloudinary';

import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import { CloudinaryService } from '../../../configs/cloudinary/cloudinary.service';
import { ICustomLogger } from '../../logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '../../logger/interface/logger-factory.interface';
import { IUploadsUtility } from '../interface/upload.utility.interface';

@Injectable()
export class UploadsUtility implements IUploadsUtility {
  private readonly logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory,
    private readonly _cloudinaryService: CloudinaryService
  ) {
    this.logger = this._loggerFactory.createLogger(UploadsUtility.name);
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) throw new Error('No file provided');
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('Invalid file type. Only images are allowed.');
      }
      const result = await this._cloudinaryService.uploadImage(file);
      return result.url;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Something happened while uploading image');
    }
  }

  async uploadsImage(file: Express.Multer.File, publicId: string): Promise<UploadApiResponse> {
    try {
      if (!file) throw new Error('No file provided');
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      return await this._cloudinaryService.uploadsImage(file, publicId);
    } catch (err) {
      this.logger.error('Error uploading image: ', err.message, err.stack);
      throw new InternalServerErrorException('Something happened while uploading image');
    }
  }

  getSignedImageUrl(publicId: string, expiresIn: number = 300): string {
    return this._cloudinaryService.generateSignedUrl(publicId, expiresIn)
  }
}
