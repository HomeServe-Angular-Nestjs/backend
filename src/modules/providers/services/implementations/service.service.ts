import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IServiceFeatureService } from '../interfaces/service-service.interface';
import {
  CreateServiceDto,
  CreateSubServiceDto,
  UpdateServiceDto,
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
  ) {}

  async createService(
    dto: CreateServiceDto,
    user: IPayload,
  ): Promise<ServiceOffered> {
    try {
      const provider = await this.providerRepository.findByEmail(user.email);

      if (!provider) {
        throw new UnauthorizedException('The user is not found');
      }

      const serviceImageUrl = await this.uploadsUtility.uploadImage(
        dto.imageFile,
      );

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
      const services = await this.providerRepository.fetchOfferedServices(
        user.sub,
      );
      if (!services) {
        throw new Error('Could find the provider');
      }

      return services ? services : [];
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'Something happened while fetching the offered service',
      );
    }
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
