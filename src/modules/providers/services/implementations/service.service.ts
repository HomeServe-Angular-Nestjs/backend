import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IServiceFeatureService } from '../interfaces/service-service.interface';
import {
  CreateServiceDto,
  CreateSubServiceDto,
  UpdateServiceDto,
  UpdateSubServiceWrapperDto,
} from '../../dtos/service.dto';
import { IProviderRepository } from '../../../../core/repositories/interfaces/provider-repo.interface';
import {
  PROVIDER_REPOSITORY_INTERFACE_NAME,
  SERVICE_OFFERED_REPOSITORY_NAME,
} from '../../../../core/constants/repository.constant';
import { IPayload } from '../../../auth/misc/payload.interface';
import { ServiceOffered } from '../../../../core/entities/implementation/service.entity';
import { UPLOAD_UTILITY_NAME } from '../../../../core/constants/utility.constant';
import { IUploadsUtility } from '../../../../core/utilities/interface/upload.utility.interface';
import { IServiceOfferedRepository } from '../../../../core/repositories/interfaces/serviceOffered-repo.interface';
import {
  IService,
  ISubService,
} from '../../../../core/entities/interfaces/service.entity.interface';

@Injectable()
export class ServiceFeatureService implements IServiceFeatureService {
  constructor(
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private providerRepository: IProviderRepository,
    @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
    private serviceOfferedRepository: IServiceOfferedRepository,
    @Inject(UPLOAD_UTILITY_NAME)
    private uploadsUtility: IUploadsUtility,
  ) { }

  private readonly logger = new Logger(ServiceFeatureService.name);

  async createService(
    dto: CreateServiceDto,
    user: IPayload,
  ): Promise<ServiceOffered> {
    try {
      const provider = await this.providerRepository.findByEmail(user.email);

      if (!provider) {
        throw new UnauthorizedException('The user is not found');
      }

      const serviceImageUrl = await this.uploadsUtility.uploadImage(dto.imageFile);

      const subServicesWithImages = dto.subServices
        ? await this.handleSubServices(dto.subServices)
        : [];

      const newOfferedService = await this.serviceOfferedRepository.create({
        title: dto.serviceTitle,
        desc: dto.serviceDesc,
        image: serviceImageUrl,
        subService: subServicesWithImages,
      });

      const updatedProvider = await this.providerRepository.findOneAndUpdate(
        { _id: provider.id },
        {
          $push: { servicesOffered: new Types.ObjectId(newOfferedService.id) },
        },
        { new: true },
      );

      if (!updatedProvider) {
        throw new Error(
          'Something happened while updating the provider schema',
        );
      }

      return newOfferedService;
    } catch (err) {
      console.error(err);

      if (err instanceof UnauthorizedException) {
        throw err;
      }

      throw new InternalServerErrorException('Something unexpected happened.');
    }
  }

  async fetchServices(user: IPayload): Promise<IService[]> {
    try {
      const provider = await this.providerRepository.findOne({ _id: new Types.ObjectId(user.sub) });
      if (!provider) {
        throw new Error('Could find the provider');
      }

      const offeredServices = await Promise.all(
        provider.servicesOffered.map(async (id: string): Promise<IService | undefined> => {
          const service = await this.serviceOfferedRepository.findOne({ _id: new Types.ObjectId(id) });
          return service ? service : undefined
        })
      );

      return offeredServices.filter(service => service !== undefined);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'Something happened while fetching the offered service',
      );
    }
  }

  async fetchService(id: string): Promise<IService> {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const service = await this.serviceOfferedRepository.findOne({ _id: id });

    if (!service) {
      throw new NotFoundException('Service is not found');
    }

    return service;
  }

  async updateService(updateData: UpdateServiceDto): Promise<IService> {
    if (updateData.id) {
      const { id, ...updateFields } = updateData;

      const updatedService =
        await this.serviceOfferedRepository.findOneAndUpdate(
          { _id: id },
          { $set: updateFields },
          { new: true },
        );

      if (!updatedService) {
        throw new NotFoundException(
          'Service not found or could not be updated',
        );
      }

      return updatedService;
    }

    throw new BadRequestException('Service id is missing');
  }

  async updateSubservice(updateData: UpdateSubServiceWrapperDto) {
    try {

      console.log(updateData)
      const { id: serviceId, subService } = updateData;
      const { id: subServiceId, ...subServiceFields } = subService;

      if (!serviceId || !subService?.id) {
        throw new BadRequestException('Both service ID and subService ID are required.');
      }

      const setObject: Record<string, any> = {};
      for (const [key, value] of Object.entries(subServiceFields)) {
        if (value !== undefined) {
          setObject[`subService.$.${key}`] = value;
        }
      }

      const updatedService =
        await this.serviceOfferedRepository.findOneAndUpdate(
          {
            _id: serviceId,
            "subService._id": subServiceId
          },
          { $set: setObject },
          { new: true },
        );

      if (!updatedService) {
        throw new NotFoundException('No matching sub-service found to update.');
      }

      const updated = updatedService?.subService.find(
        s => s.id === subServiceId
      );

      return { id: serviceId, subService: updated };
    } catch (err) {
      this.logger.error('Failed to update subService', err.stack);
      throw new InternalServerErrorException('Failed to update subService');
    }
  }

  private async handleSubServices(
    subServices: CreateSubServiceDto[],
  ): Promise<ISubService[]> {
    return Promise.all(
      subServices.map(async (sub) => ({
        title: sub.title,
        desc: sub.desc,
        estimatedTime: sub.estimatedTime,
        image: sub.imageFile
          ? await this.uploadsUtility.uploadImage(sub.imageFile)
          : '',
        price: sub.price,
        tag: sub.tag,
      })),
    );
  }
}
