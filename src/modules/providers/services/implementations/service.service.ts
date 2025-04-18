import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { IServiceFeatureService } from '../interfaces/service-service.interface';
import { CreateServiceDto, CreateSubServiceDto } from '../../dtos/service.dto';
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
import { ISubService } from '../../../../core/entities/interfaces/service.entity.interface';
import { Types } from 'mongoose';

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

  async createService(dto: CreateServiceDto, user: IPayload,): Promise<ServiceOffered> {
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
      console.log(newOfferedService);

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
