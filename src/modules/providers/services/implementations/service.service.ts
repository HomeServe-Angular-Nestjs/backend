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
  FilterServiceDto,
  UpdateServiceDto,
  UpdateSubServiceWrapperDto,
} from '../../dtos/service.dto';
import { IProviderRepository } from '../../../../core/repositories/interfaces/provider-repo.interface';
import {
  CUSTOMER_REPOSITORY_INTERFACE_NAME,
  PROVIDER_REPOSITORY_INTERFACE_NAME,
  SERVICE_OFFERED_REPOSITORY_NAME,
} from '../../../../core/constants/repository.constant';
import { IPayload } from '../../../../core/misc/payload.interface';
import { ServiceOffered } from '../../../../core/entities/implementation/service.entity';
import { UPLOAD_UTILITY_NAME } from '../../../../core/constants/utility.constant';
import { IUploadsUtility } from '../../../../core/utilities/interface/upload.utility.interface';
import { IServiceOfferedRepository } from '../../../../core/repositories/interfaces/serviceOffered-repo.interface';
import {
  IService,
  ISubService,
} from '../../../../core/entities/interfaces/service.entity.interface';
import { ICustomerRepository } from '../../../../core/repositories/interfaces/customer-repo.interface';

@Injectable()
export class ServiceFeatureService implements IServiceFeatureService {
  private readonly logger = new Logger(ServiceFeatureService.name);

  constructor(
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private _providerRepository: IProviderRepository,
    @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
    private _serviceOfferedRepository: IServiceOfferedRepository,
    @Inject(UPLOAD_UTILITY_NAME)
    private _uploadsUtility: IUploadsUtility,
  ) { }


  async createService(dto: CreateServiceDto, user: IPayload,): Promise<ServiceOffered> {
    try {
      const provider = await this._providerRepository.findByEmail(user.email);

      if (!provider) {
        throw new UnauthorizedException('The user is not found');
      }

      const serviceImageUrl = await this._uploadsUtility.uploadImage(dto.imageFile);

      const subServicesWithImages = dto.subServices
        ? await this._handleSubServices(dto.subServices)
        : [];

      const newOfferedService = await this._serviceOfferedRepository.create({
        title: dto.serviceTitle,
        desc: dto.serviceDesc,
        image: serviceImageUrl,
        subService: subServicesWithImages,
      });

      const updatedProvider = await this._providerRepository.findOneAndUpdate(
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
      if (err instanceof UnauthorizedException) {
        throw err;
      }

      throw new InternalServerErrorException('Something unexpected happened.');
    }
  }

  async fetchServices(user: IPayload): Promise<IService[]> {
    try {
      const provider = await this._providerRepository.findOne({ _id: new Types.ObjectId(user.sub) });
      if (!provider) {
        throw new Error('Could find the provider');
      }

      const offeredServices: (IService | undefined)[] = await Promise.all(
        provider.servicesOffered.map(async (id: string): Promise<IService | undefined> => {
          const service = await this._serviceOfferedRepository.findOne({ _id: new Types.ObjectId(id) });
          return service || undefined;
        })
      );

      let result: IService[] = offeredServices.filter(service => service !== undefined);

      result = result.map(service => {
        service.subService = service.subService.filter(sub => !sub.isDeleted);
        return service;
      });

      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        'Something happened while fetching the offered service',
      );
    }
  }

  async fetchService(id: string): Promise<IService> {
    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const service = await this._serviceOfferedRepository.findOne({ _id: id });

    if (!service) {
      throw new NotFoundException('Service is not found');
    }

    return service;
  }


  async updateService(updateData: UpdateServiceDto): Promise<IService> {
    if (!updateData?.id) {
      throw new BadRequestException('Service ID is missing.');
    }

    const { id, ...updateFields } = updateData;

    // Handle main service image upload
    if (updateFields.image) {
      updateFields.image = await this._processImage(updateFields.image);
    }

    if (Array.isArray(updateFields.subServices) && updateFields.subServices.length > 0) {
      updateFields.subServices = await Promise.all(
        updateFields.subServices.map(async (sub) => {
          const updatedSub = { ...sub };
          updatedSub.image = await this._processImage(sub.image);
          return updatedSub;
        })
      );
    }

    const updatedService = await this._serviceOfferedRepository.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedService) {
      throw new NotFoundException('No matching service found to update.');
    }

    return updatedService;
  }


  async updateSubservice(updateData: UpdateSubServiceWrapperDto): Promise<{ id: string, subService: ISubService }> {
    try {
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

      const updatedService = await this._serviceOfferedRepository.findOneAndUpdate(
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

      return { id: serviceId, subService: updated as ISubService };
    } catch (err) {
      this.logger.error('Failed to update subService', err.stack);
      throw new InternalServerErrorException('Failed to update subService');
    }
  }

  async fetchFilteredServices(id: string, filter: FilterServiceDto): Promise<IService[]> {
    const provider = await this._providerRepository.findById(id);
    if (!provider) {
      throw new NotFoundException('Provider with ID ${id} not found');
    }

    const services = (await Promise.all(
      provider.servicesOffered.map((serviceId: string) =>
        serviceId ? this._serviceOfferedRepository.findById(serviceId) : Promise.resolve(null)
      )
    )).filter(service => service !== null);

    let filteredServices = services;

    // Search in title or description
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filteredServices = filteredServices.filter(service =>
        service.title.toLowerCase().includes(searchLower) ||
        service.desc?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by category
    if (filter.category) {
      filteredServices = filteredServices.filter(service =>
        service.title === filter.category
      )
    }

    // Price filter
    if (filter.priceRange) {
      const { min, max } = filter.priceRange;

      filteredServices = filteredServices.filter(service =>
        service.subService.some(sub => {
          if (sub?.price == null) return false;

          const price = typeof sub.price === 'string' ? parseFloat(sub.price) : sub.price;
          if (isNaN(price)) return false;

          return (
            (min === undefined || price >= min) &&
            (max === undefined || price <= max)
          );
        })
      );
    }

    // Duration filter 
    if (filter.duration) {
      const { minHours, maxHours } = filter.duration;

      filteredServices = filteredServices.filter(service =>
        service.subService.some(sub => {
          if (sub?.estimatedTime == null) return false;

          const duration = typeof sub.estimatedTime === 'string'
            ? parseFloat(sub.estimatedTime)
            : sub.estimatedTime;

          if (isNaN(duration)) return false;

          return (
            (minHours == null || duration >= minHours) &&
            (maxHours == null || duration <= maxHours)
          );
        })
      );
    }

    // Sort by min subService price or duration
    if (filter.sort) {
      const getMinSubField = (service: IService, field: 'price' | 'duration') =>
        Math.min(...service.subService.map(sub => sub[field]));

      switch (filter.sort) {
        case 'price-asc':
          filteredServices = filteredServices.sort((a, b) =>
            getMinSubField(a, 'price') - getMinSubField(b, 'price')
          );
          break;
        case 'price-desc':
          filteredServices = filteredServices.sort((a, b) =>
            getMinSubField(b, 'price') - getMinSubField(a, 'price')
          );
          break;
        case 'duration-asc':
          filteredServices = filteredServices.sort((a, b) =>
            getMinSubField(a, 'duration') - getMinSubField(b, 'duration')
          );
          break;
        case 'duration-desc':
          filteredServices = filteredServices.sort((a, b) =>
            getMinSubField(b, 'duration') - getMinSubField(a, 'duration')
          );
          break;
        case 'popular':
          // Add your own popularity logic if applicable
          break;
      }
    }


    return filteredServices;

  }

  private async _handleSubServices(subServices: CreateSubServiceDto[]): Promise<ISubService[]> {
    return Promise.all(
      subServices.map(async (sub) => ({
        title: sub.title,
        desc: sub.desc,
        estimatedTime: sub.estimatedTime,
        image: sub.imageFile
          ? await this._uploadsUtility.uploadImage(sub.imageFile)
          : '',
        price: sub.price,
        tag: sub.tag,
      })),
    );
  }

  private async _processImage(image: string | Express.Multer.File): Promise<string | undefined> {
    if (!image) return undefined;
    if (typeof image === 'string') return image;

    try {
      return await this._uploadsUtility.uploadImage(image);
    } catch (error) {
      this.logger.error('Image upload failed:', error);
      throw new InternalServerErrorException('Failed to upload image.');
    }
  }
}
