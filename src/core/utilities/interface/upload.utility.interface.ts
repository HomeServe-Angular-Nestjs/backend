import { UploadApiResponse } from "cloudinary";

export interface IUploadsUtility {
  uploadImage(file: Express.Multer.File, publicId?: string): Promise<string>;
  uploadsImage(file: Express.Multer.File, publicId: string): Promise<UploadApiResponse>;
getSignedImageUrl(publicId: string, expiresIn: number): string}
