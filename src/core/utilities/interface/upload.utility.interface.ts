export interface IUploadsUtility {
  uploadImage(file: Express.Multer.File): Promise<string>;
}
