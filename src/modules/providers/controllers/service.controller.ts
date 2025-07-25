import { Request } from 'express';

import {
    BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException,
    NotFoundException, Patch, Post, Put, Query, Req, UnauthorizedException, UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { SERVICE_OFFERED_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IService } from '../../../core/entities/interfaces/service.entity.interface';
import { ErrorMessage } from '../../../core/enum/error.enum';
import { ICustomLogger } from '../../../core/logger/interface/custom-logger.interface';
import {
    ILoggerFactory, LOGGER_FACTORY
} from '../../../core/logger/interface/logger-factory.interface';
import { IPayload } from '../../../core/misc/payload.interface';
import { IResponse } from '../../../core/misc/response.util';
import {
    CreateServiceDto, CreateSubServiceDto, FilterServiceDto, ProviderServiceFilterWithPaginationDto,
    RemoveServiceDto, RemoveSubServiceDto, ToggleServiceStatusDto, ToggleSubServiceStatusDto,
    UpdateServiceDto
} from '../dtos/service.dto';
import { IServiceFeatureService } from '../services/interfaces/service-service.interface';

@Controller('provider')
export class ServiceController {
  private readonly logger: ICustomLogger;
  
  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
    @Inject(SERVICE_OFFERED_SERVICE_NAME)
    private readonly _serviceFeature: IServiceFeatureService,
  ) {
    this.logger = this.loggerFactory.createLogger(ServiceController.name);
  }

  /**
   * Handles the creation of a new service along with its associated sub - services and image uploads.
   * @param body - The parsed body of the request, expected to include service details and sub - services.
   * @param files - An array of uploaded files(service image + sub - service images).
   */
  @Post('service')
  @UseInterceptors(AnyFilesInterceptor())
  async createService(@Req() req: Request, @Body() body: CreateServiceDto, @UploadedFiles() files: Express.Multer.File[]): Promise<IResponse<string[]>> {
    try {

      const user = req.user as IPayload;
      if (!user.sub) {
        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
      }

      const serviceImageFile = files.find((f) => f.fieldname === 'image');

      if (!serviceImageFile) {
        throw new BadRequestException('service image is missing');
      }

      let subService: CreateSubServiceDto[] = [];

      if (body.subService) {
        // Extract and map sub-service images using regex to find their corresponding index
        const subServicesImage = files
          .filter((f) => f.fieldname.startsWith('subService['))
          .map((f) => {
            const match = f.fieldname.match(/^subService\[(\d+)]\[image]$/);
            return match ? { index: +match[1], file: f } : null;
          })
          .filter(Boolean) as { index: number; file: Express.Multer.File }[];

        // Parse the subServices from string if not already an array
        subService = Array.isArray(body?.subService)
          ? (body?.subService ?? [])
          : JSON.parse(body?.subService ?? []);

        // Append image files to their respective sub-service entries by index
        subServicesImage.forEach(({ index, file }) => {
          if (subService && subService[index]) {
            subService[index].image = file;
          }
        });
      }

      const serviceData: CreateServiceDto = {
        title: body.title,
        desc: body.desc,
        image: serviceImageFile,
        subService,
      };

      return await this._serviceFeature.createService(user.sub, serviceData);
    } catch (err) {
      this.logger.error(`Error creating service: ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(['service'])
  async getOfferedServices(@Req() req: Request, @Query() dto: ProviderServiceFilterWithPaginationDto) {
    try {
      const user = req.user as IPayload;
      if (!user.sub) {
        throw new BadRequestException('User id is missing.');
      }

      const { page, ...filter } = dto;
      return await this._serviceFeature.fetchServices(user.sub, page, filter);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(['offered_service'])
  async getOfferedService(@Query() query: { id: string }) {
    try {
      return this._serviceFeature.fetchService(query.id);
    } catch (err) {
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(['service'])
  @UseInterceptors(AnyFilesInterceptor())
  async updateService(@Body() dto: any, @UploadedFiles() files: Express.Multer.File[]): Promise<IResponse<IService>> {
    try {
      let prepareDto: UpdateServiceDto = dto;

      if (files) {
        prepareDto = this._attachFilesToServiceData(dto, files);
      }

      return await this._serviceFeature.updateService(prepareDto);
    } catch (err) {
      this.logger.error('Error updating services: ', err.message, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('filter_service')
  async fetchFilteredServices(@Query() dto: FilterServiceDto): Promise<IService[]> {
    try {
      const { id } = dto;
      if (!id) {
        throw new NotFoundException(`Provider with ID ${id} not found`);
      }

      return await this._serviceFeature.fetchFilteredServices(id, dto);
    } catch (err) {
      this.logger.error(`Error fetching filtered service: ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('service/status')
  async toggleServiceStatus(@Body() dto: ToggleServiceStatusDto) {
    try {
      if (!dto.id || dto.isActive === undefined) {
        throw new BadRequestException('Required data is missing');
      }

      return await this._serviceFeature.toggleServiceStatus(dto)
    } catch (err) {
      this.logger.error(`Error toggling service status for Service ID ${dto.id}: ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('service/sub_status')
  async toggleSubServiceStatus(@Body() dto: ToggleSubServiceStatusDto) {
    try {
      return await this._serviceFeature.toggleSubServiceStatus(dto);
    } catch (err) {
      this.logger.error(`Error toggling service status for SubService ID ${dto.subService.id}: ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('service/remove')
  async removeService(@Req() req: Request, @Body() dto: RemoveServiceDto) {
    try {
      const user = req.user as IPayload;
      if (!user.sub) {
        throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
      }

      return await this._serviceFeature.removeService(user.sub, dto.serviceId);

    } catch (err) {
      this.logger.error(`Error removing service : ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('service/remove_sub')
  async removeSubService(@Body() dto: RemoveSubServiceDto) {
    try {
      return await this._serviceFeature.removeSubService(dto);
    } catch (err) {
      this.logger.error(`Error removing sub service : ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('service/titles')
  async getServiceTitle(): Promise<IResponse<string[]>> {
    try {
      return await this._serviceFeature.getServiceTitles();
    } catch (err) {
      this.logger.error(`Error fetching service titles : ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  private _attachFilesToServiceData(dto: UpdateServiceDto, files: Express.Multer.File[]) {
    const result = { ...dto };

    // Attach main service image
    const image = files.find(file => file.fieldname === 'image');
    if (image) {
      result.image = image;
    } else if (dto.image) {
      result.image = dto.image;
    }

    result.subService = (dto.subService || []).map((sub: any, index: number) => {
      const subResult: any = { ...sub };

      const image = files.find(file => file.fieldname === `subService[${index}][image]`);

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
