import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "../../../configs/cloudinary/cloudinary.service";

@Controller()
export class UploadController {

    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post(['provider/uploadImage'])
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        const result = await this.cloudinaryService.uploadImage(file);
        return { imageUrl: result.url }
    }
}