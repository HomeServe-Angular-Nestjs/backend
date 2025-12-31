import { UploadApiResponse } from 'cloudinary';

import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import { CloudinaryService } from '../../../configs/cloudinary/cloudinary.service';
import { ICustomLogger } from '../../logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '../../logger/interface/logger-factory.interface';
import { IUploadsUtility } from '../interface/upload.utility.interface';
import { UploadsType } from '@core/enum/uploads.enum';
import { UserType } from '@core/entities/interfaces/user.entity.interface';

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

  getPublicId(userType: UserType, userId: string, uploadType: UploadsType, uniqueId: string): string {
    return `${userType}/${userId}/${uploadType}/${uniqueId}`;
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
    if (!publicId || !publicId.trim()) return '';

    const googleDomains = [
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'googleusercontent.com',
      'www.googleapis.com'
    ];

    const cloudinaryDomains = [
      'res.cloudinary.com'
    ];

    let isGoogleImage = false;
    let isCloudinaryUrl = false;

    try {
      const url = new URL(publicId);
      const host = url.hostname.toLowerCase();

      isGoogleImage = googleDomains.includes(host);
      isCloudinaryUrl = cloudinaryDomains.includes(host);

      if (!isGoogleImage) {
        isGoogleImage = googleDomains.some(domain => host.endsWith(domain));
      }

      if (!isCloudinaryUrl) {
        isCloudinaryUrl = cloudinaryDomains.some(domain => host.endsWith(domain));
      }

    } catch {
      isGoogleImage = false;
      isCloudinaryUrl = false;
    }

    if (isGoogleImage || isCloudinaryUrl) return publicId;
    return this._cloudinaryService.generateSignedUrl(publicId, expiresIn);
  }

  async deleteImageByPublicId(publicId: string): Promise<boolean> {
    try {
      const res = await this._cloudinaryService.delete(publicId);

      if (res.result === 'ok') {
        this.logger.log('Image deleted successfully');
        return true;
      }

      if (res.result === 'not found') {
        this.logger.warn('Image not found on Cloudinary');
        return false;
      }

      return false;
    } catch (err) {
      this.logger.error('Cloudinary deletion error:', err);
      return false;
    }
  }
}
