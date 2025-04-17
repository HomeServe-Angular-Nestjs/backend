import { Body, Controller, Inject, Post, Req, Res, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "../../../configs/cloudinary/cloudinary.service";
import { Request, Response } from "express";
import { IServiceFeatureService } from "../services/interfaces/service-service.interface";
import { SERVICE_SERVICE_NAME } from "../../../core/constants/service.constant";
import { CreateServiceDto } from "../dtos/service.dto";

@Controller()
export class ServiceController {

    constructor(private readonly cloudinaryService: CloudinaryService,
        @Inject(SERVICE_SERVICE_NAME)
        private serviceFeature: IServiceFeatureService
    ) { }

    /**
    * Handles the creation of a new service along with its associated sub - services and image uploads.    *  
    * @param req - The HTTP request object provided by Express.
    * @param res - The HTTP response object provided by Express.
    * @param body - The parsed body of the request, expected to include service details and sub - services.
    * @param files - An array of uploaded files(service image + sub - service images).
    * @returns 
    */

    @Post('provider/create_service')
    @UseInterceptors(AnyFilesInterceptor())
    async createNewService(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: any,
        @UploadedFiles() files: Express.Multer.File[]
    ): Promise<void> {

        // Extract the main service image from the uploaded files
        const serviceImageFile = files.find(f => f.fieldname === 'serviceImageFile');

        // Extract and map sub-service images using regex to find their corresponding index
        const subServicesImage = files
            .filter(f => f.fieldname.startsWith('subServices['))
            .map(f => {
                const match = f.fieldname.match(/^subServices\[(\d+)]\[imageFile]$/);
                return match ? { index: +match[1], file: f } : null;
            })
            .filter(Boolean) as { index: number, file: Express.Multer.File }[];

        // Parse the subServices from string if not already an array
        const subServices = Array.isArray(body.subServices)
            ? body.subServices
            : JSON.parse(body.subServices);

        // Append image files to their respective sub-service entries by index
        subServicesImage.forEach(({ index, file }) => {
            if (subServices[index]) {
                subServices[index].imageFile = file;
            }
        });

        // Final composed service data object
        const serviceData: CreateServiceDto = {
            serviceTitle: body.serviceTitle,
            serviceDesc: body.serviceDesc,
            imageFile: serviceImageFile,
            subServices
        };

        await this.serviceFeature.createService(serviceData)
    }
}