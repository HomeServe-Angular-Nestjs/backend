import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { IServiceFeatureService } from '../services/interfaces/service-service.interface';
import { SERVICE_OFFERED_SERVICE_NAME } from '../../../core/constants/service.constant';
import {
  CreateServiceDto,
  CreateSubServiceDto,
  UpdateServiceDto,
  UpdateSubServiceDto,
  UpdateSubServiceWrapperDto,
} from '../dtos/service.dto';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { IPayload } from '../../auth/misc/payload.interface';

@Controller()
export class ServiceController {
  constructor(
    @Inject(SERVICE_OFFERED_SERVICE_NAME)
    private serviceFeature: IServiceFeatureService,
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
  @UseInterceptors(AuthInterceptor, AnyFilesInterceptor())
  async createNewService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<void> {
    try {
      const user = req.user as IPayload;

      const serviceImageFile = files.find(
        (f) => f.fieldname === 'serviceImageFile',
      );
      if (!serviceImageFile) {
        throw new BadRequestException('service image is missing');
      }

      let subServices: CreateSubServiceDto[] = [];

      if (body.subServices) {
        // Extract and map sub-service images using regex to find their corresponding index
        const subServicesImage = files
          .filter((f) => f.fieldname.startsWith('subServices['))
          .map((f) => {
            const match = f.fieldname.match(
              /^subServices\[(\d+)]\[imageFile]$/,
            );
            return match ? { index: +match[1], file: f } : null;
          })
          .filter(Boolean) as { index: number; file: Express.Multer.File }[];

        // Parse the subServices from string if not already an array
        subServices = Array.isArray(body?.subServices)
          ? (body?.subServices ?? [])
          : JSON.parse(body?.subServices ?? []);

        // Append image files to their respective sub-service entries by index
        subServicesImage.forEach(({ index, file }) => {
          if (subServices && subServices[index]) {
            subServices[index].imageFile = file;
          }
        });
      }

      const serviceData: CreateServiceDto = {
        serviceTitle: body.serviceTitle,
        serviceDesc: body.serviceDesc,
        imageFile: serviceImageFile,
        subServices,
      };

      await this.serviceFeature.createService(serviceData, user);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'Something happened while creating new service',
      );
    }
  }

  @Get(['provider/offered_services'])
  @UseInterceptors(AuthInterceptor) //! Don't touch it 'cause it is working
  async getOfferedServices(@Req() req: Request) {
    try {
      const user = req.user as IPayload;
      return await this.serviceFeature.fetchServices(user);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something happened while fetching offered services',
      );
    }
  }

  @Get(['provider/offered_service'])
  async getOfferedService(@Query() query: { id: string }) {
    try {
      return this.serviceFeature.fetchService(query.id);
    } catch (err) {
      throw new InternalServerErrorException(
        'Something happened while fetching offered services',
      );
    }
  }

  // @Get(['provider/fetch_subservice'])
  // async fetchSubservice(@Query() query: { id: string }) {
  //   try {
  //     return this.serviceFeature.fetchSubService(query.id);
  //   } catch (err) {
  //     throw new InternalServerErrorException(
  //       'Something happened while fetching offered services',
  //     );
  //   }
  // }

  @Patch(['provider/offered_services'])
  @UseInterceptors(AuthInterceptor)
  async updateService(@Body() dto: UpdateServiceDto) {
    try {
      return await this.serviceFeature.updateService(dto);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }

      if (err instanceof BadRequestException) {
        throw new BadRequestException(err.message);
      }

      throw new InternalServerErrorException(
        'An error occurred while updating the service',
      );
    }
  }

  @Patch(['provider/subservice'])
  async updateSubservice(@Body() dto: UpdateSubServiceWrapperDto) {
    return await this.serviceFeature.updateSubservice(dto);
  }
}
