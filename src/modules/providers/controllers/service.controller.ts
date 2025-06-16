import {
  BadGatewayException,
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
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { IServiceFeatureService } from '../services/interfaces/service-service.interface';
import { SERVICE_OFFERED_SERVICE_NAME } from '../../../core/constants/service.constant';
import {
  CreateServiceDto,
  CreateSubServiceDto,
  FilterServiceDto,
  ProviderServiceFilterWithPaginationDto,
  RemoveServiceDto,
  RemoveSubServiceDto,
  ToggleServiceStatusDto,
  ToggleSubServiceStatusDto,
  UpdateServiceDto,
  UpdateSubServiceWrapperDto,
} from '../dtos/service.dto';

import { IPayload } from '../../../core/misc/payload.interface';
import { IService } from '../../../core/entities/interfaces/service.entity.interface';
import { IResponse } from 'src/core/misc/response.util';

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

  @Post('provider/service')
  @UseInterceptors(AnyFilesInterceptor())
  async creatService(@Req() req: Request, @Body() body: CreateServiceDto, @UploadedFiles() files: Express.Multer.File[]): Promise<IResponse<string[]>> {
    try {

      const user = req.user as IPayload;
      if (!user.sub) {
        throw new BadRequestException('user id is missing.');
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
      throw new InternalServerErrorException('Something happened while creating new service');
    }
  }

  @Get(['provider/service'])
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
      throw new InternalServerErrorException(
        'Something happened while fetching offered services',
      );
    }
  }

  @Get(['provider/offered_service'])
  async getOfferedService(@Query() query: { id: string }) {
    try {
      return this._serviceFeature.fetchService(query.id);
    } catch (err) {
      throw new InternalServerErrorException(
        'Something happened while fetching offered services',
      );
    }
  }

  @Put(['provider/service'])
  @UseInterceptors(AnyFilesInterceptor())
  async updateService(@Body() dto: UpdateServiceDto, @UploadedFiles() files: Express.Multer.File[]): Promise<IResponse<IService>> {
    try {
      let prepareDto: UpdateServiceDto = dto;

      if (files) {
        prepareDto = this._attachFilesToServiceData(dto, files);
      }

      return await this._serviceFeature.updateService(prepareDto);
    } catch (err) {
      this.logger.error(err);
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

  @Get('provider/filter_service')
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

  @Patch('provider/service/status')
  async toggleServiceStatus(@Body() dto: ToggleServiceStatusDto) {
    try {
      if (!dto.id || dto.isActive === undefined) {
        throw new BadRequestException('Required data is missinng');
      }

      return await this._serviceFeature.toggleServiceStatus(dto)
    } catch (err) {
      this.logger.error(`Error toggling service status for Service ID ${dto.id}: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to toggle service status');
    }
  }

  @Patch('provider/service/sub_status')
  async toggleSubServiceStatus(@Body() dto: ToggleSubServiceStatusDto) {
    try {
      return await this._serviceFeature.toggleSubServiceStatus(dto);
    } catch (err) {
      this.logger.error(`Error toggling service status for Subervice ID ${dto.subService.id}: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to toggle service status');
    }
  }

  @Patch('provider/service/remove')
  async removeService(@Req() req: Request, @Body() dto: RemoveServiceDto) {
    try {
      const user = req.user as IPayload;
      if (!user.sub) {
        throw new BadRequestException('User id is missing.');
      }

      return await this._serviceFeature.removeService(user.sub, dto.serviceId);

    } catch (err) {
      this.logger.error(`Error removing service : ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed remove service');
    }
  }

  @Patch('provider/service/remove_sub')
  async removeSubService(@Body() dto: RemoveSubServiceDto) {
    try {
      return await this._serviceFeature.removeSubService(dto);
    } catch (err) {
      this.logger.error(`Error removing sub service : ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to remove sub service.');
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
