import { UploadsType } from '@core/enum/uploads.enum';
import { UserType } from '@modules/auth/dtos/login.dto';
import { UploadApiResponse } from 'cloudinary';

export interface IUploadsUtility {
  uploadImage(file: Express.Multer.File, publicId?: string): Promise<string>;
  uploadsImage(file: Express.Multer.File, publicId: string): Promise<UploadApiResponse>;
  getSignedImageUrl(publicId: string, expiresIn?: number): string;
  getPublicId(userType: UserType, userId: string, uploadType: UploadsType, uniqueId: string): string;
}
