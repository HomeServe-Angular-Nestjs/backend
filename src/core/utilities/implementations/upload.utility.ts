import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CloudinaryService } from "../../../configs/cloudinary/cloudinary.service";
import { IUploadsUtility } from "../interface/upload.utility.interface";

@Injectable()
export class UploadsUtility implements IUploadsUtility {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    async uploadImage(file: Express.Multer.File): Promise<string> {
        try {
            if (!file) throw new Error('No file provided');
            if (!file.mimetype.startsWith('image/')) {
                throw new Error('Invalid file type. Only images are allowed.');
            }
            const result = await this.cloudinaryService.uploadImage(file);
            return result.url;
        } catch (err) {
            throw new InternalServerErrorException('Something happened while uploading image')
        }
    }
}