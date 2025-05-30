import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
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
  FilterServiceDto,
  UpdateServiceDto,
  UpdateSubServiceWrapperDto,
} from '../dtos/service.dto';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { IPayload } from '../../../core/misc/payload.interface';
import { IService } from '../../../core/entities/interfaces/service.entity.interface';

@Controller()
export class ServiceController {
  private readonly logger = new Logger(ServiceController.name);

  constructor(
    @Inject(SERVICE_OFFERED_SERVICE_NAME)
    private readonly _serviceFeature: IServiceFeatureService,
  ) { }

  /**
   * Handles the creation of a new service along with its associated sub - services and image uploads.
   * @param req - The HTTP request object provided by Express.
   * @param res - The HTTP response object provided by Express.
   * @param body - The parsed body of the request, expected to include service details and sub - services.
   * @param files - An array of uploaded files(service image + sub - service images).
   * @returns - void
   */

  @Post('provider/create_service')
  @UseInterceptors(AuthInterceptor, AnyFilesInterceptor())
  async createNewService(
    @Req() req: Request,
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

      await this._serviceFeature.createService(serviceData, user);
    } catch (err) {
      this.logger.error(`Error creating service: ${err.message}`, err.stack);
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
      return await this._serviceFeature.fetchServices(user);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'Something happened while fetching offered services',
      );
    }
  }

  @Get(['provider/offered_service'])
  @UseInterceptors(AuthInterceptor)
  async getOfferedService(@Query() query: { id: string }) {
    try {
      return this._serviceFeature.fetchService(query.id);
    } catch (err) {
      throw new InternalServerErrorException(
        'Something happened while fetching offered services',
      );
    }
  }

  @Patch(['provider/offered_service'])
  @UseInterceptors(AuthInterceptor, AnyFilesInterceptor())
  async updateService(@Body() dto: UpdateServiceDto, @UploadedFiles() files: Express.Multer.File[]) {
    try {
      const prepareDto = this._attachFilesToServiceData(dto, files);
      return await this._serviceFeature.updateService(prepareDto);
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
  @UseInterceptors(AuthInterceptor)
  async updateSubservice(@Body() dto: UpdateSubServiceWrapperDto) {
    try {
      return await this._serviceFeature.updateSubservice(dto);
    } catch (err) {
      this.logger.error(`Error updating service: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to update subservice');
    }
  }

  @Get('provider/filter_service')
  @UseInterceptors(AuthInterceptor)
  async fetchFilteredServices(@Query() dto: FilterServiceDto): Promise<IService[]> {
    try {
      const { id } = dto;
      if (!id) {
        throw new NotFoundException(`Provider with ID ${id} not found`);
      }

      return await this._serviceFeature.fetchFilteredServices(id, dto);
    } catch (err) {
      this.logger.error(`Error fetching filtered service: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to fetch filtered service');
    }
  }

  private _attachFilesToServiceData(dto: UpdateServiceDto, files: Express.Multer.File[]) {
    const result = { ...dto };

    // Attach main service image
    const image = files.find(file => file.fieldname === 'serviceImageFile');
    if (image) {
      result.image = image;
    } else if (dto.image) {
      result.image = dto.image;
    }

    result.subServices = (dto.subServices || []).map((sub: any, index: number) => {
      const subResult: any = { ...sub };

      const image = files.find(file => file.fieldname === `subServices[${index}][imageFile]`);

      if (image) {
        subResult.image = image;
      } else if (sub.image) {
        subResult.image = sub.image
      }

      return subResult;
    });

    return result;
  }
}
