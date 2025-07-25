import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { CloudinaryService } from '@configs/cloudinary/cloudinary.service';
import { IFetchReviews, IProvider } from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { UploadsType } from '@core/enum/uploads.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IServiceOfferedRepository } from '@core/repositories/interfaces/serviceOffered-repo.interface';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { UserType } from '@modules/auth/dtos/login.dto';
import { FilterDto, GetProvidersFromLocationSearch, SlotDto, UpdateBioDto } from '@modules/providers/dtos/provider.dto';
import { IProviderServices } from '@modules/providers/services/interfaces/provider-service.interface';
import { PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper';

@Injectable()
export class ProviderServices implements IProviderServices {
  private readonly logger: ICustomLogger;

  constructor(
    private readonly _cloudinaryService: CloudinaryService,
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private readonly _providerRepository: IProviderRepository,
    @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
    private readonly _customerService: ICustomerRepository,
    @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
    private readonly _serviceOfferedRepository: IServiceOfferedRepository,
    @Inject(UPLOAD_UTILITY_NAME)
    private readonly _uploadsUtility: IUploadsUtility,
    @Inject(PROVIDER_MAPPER)
    private readonly _providerMapper: IProviderMapper

  ) {
    this.logger = this.loggerFactory.createLogger(ProviderServices.name);
  }

  async getProviders(filter?: FilterDto): Promise<IResponse<IProvider[]>> {
    const query: { [key: string]: any } = { isDeleted: false };

    if (filter?.search) {
      query.email = new RegExp(filter.search, 'i');
    }

    if (filter?.status && filter.status !== 'all') {
      query.isActive = filter.status;
    }

    if (filter?.isCertified) {
      query.isCertified = filter.isCertified
    }

    const providers = await this._providerRepository.find(query);

    return {
      success: true,
      message: 'Providers fetched successfully.',
      data: (providers || []).map(provider => this._providerMapper.toEntity(provider))
    }
  }

  async getProvidersLocationBasedSearch(searchData: GetProvidersFromLocationSearch): Promise<IResponse<IProvider[]>> {
    const [providers, services] = await Promise.all([
      this._providerRepository.getProvidersBasedOnLocation(searchData.lng, searchData.lat),
      this._serviceOfferedRepository.find(
        {
          $or: [
            { title: { $regex: searchData.title, $options: 'i' } },
            { 'subService.title': { $regex: searchData.title, $options: 'i' } }
          ],
          isDeleted: false,
          isActive: true
        }
      )
    ])

    const targetServiceIds = new Set(services.map(service => service.id));

    const searchedProviders = (providers ?? []).filter(provider =>
      provider.servicesOffered.some(id => targetServiceIds.has(id))
    );

    return {
      success: true,
      message: 'Providers successfully fetched.',
      data: (searchedProviders || []).map(provider => this._providerMapper.toEntity(provider))
    }
  }

  async fetchOneProvider(id: string): Promise<IProvider> {
    const provider = await this._providerRepository.findOne({ _id: id });

    if (!provider) {
      throw new NotFoundException(`No provider found for user ID: ${id}`);
    }

    return this._providerMapper.toEntity(provider);
  }

  // Performs a full update on the provider's data including avatar upload if a file is provided.
  async bulkUpdateProvider(id: string, updateData: Partial<IProvider>, file?: Express.Multer.File,): Promise<IProvider> {
    if (file) {
      const response = await this._cloudinaryService.uploadImage(file);

      if (!response) {
        throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
      }
      updateData.avatar = response.url;
    }

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(updateData).filter(
        ([_, value]) => value !== undefined && value !== null,
      ),
    );

    const updatedProvider = await this._providerRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        $set: sanitizedUpdate,
      },
      { new: true },
    );

    if (!updatedProvider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return this._providerMapper.toEntity(updatedProvider);
  }

  async partialUpdate(id: string, updateData: Partial<IProvider>): Promise<IProvider> {
    const updatedProvider = await this._providerRepository.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedProvider) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }

    return this._providerMapper.toEntity(updatedProvider);
  }

  async updateDefaultSlot(slot: SlotDto, providerId: string): Promise<IProvider> {
    const updatedProvider = await this._providerRepository.findOneAndUpdate(
      { _id: providerId },
      { $push: { defaultSlots: slot } },
      { new: true }
    );

    if (!updatedProvider) {
      throw new NotFoundException(`Provider with ID ${providerId} found`);
    }

    return this._providerMapper.toEntity(updatedProvider);
  }

  async deleteDefaultSlot(id: string): Promise<void> {
    if (!id) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    const hasDeleted = await this._providerRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        $set: { defaultSlots: [] }
      }
    );

    if (!hasDeleted) {
      throw new Error('Failed to delete default slots');
    }
  }

  async updateBio(providerId: string, dto: UpdateBioDto): Promise<IResponse<IProvider>> {
    const updateData: Partial<IProvider> = {
      additionalSkills: dto.additionalSkills,
      expertise: dto.expertises,
      languages: dto.languages,
      bio: dto.providerBio,
    };

    const updatedProvider = await this._providerRepository.findOneAndUpdate(
      { _id: providerId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedProvider) {
      throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND_WITH_ID, providerId);
    }

    return {
      message: 'Updated successfully',
      success: true,
      data: this._providerMapper.toEntity(updatedProvider)
    }
  }

  async uploadCertificate(providerId: string, label: string, file: Express.Multer.File): Promise<IResponse> {

    const uploaded = await this._cloudinaryService.uploadImage(file);

    if (!uploaded || !uploaded.url) {
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }

    const doc = {
      label,
      fileUrl: uploaded.url,
      uploadedAt: new Date(),
    }

    const updatedProvider = await this._providerRepository.findOneAndUpdate(
      { _id: providerId },
      { $push: { docs: doc } },
      { new: true }
    );

    if (!updatedProvider) {
      throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND, providerId);
    }

    const filtered: IProvider = {
      ...this._providerMapper.toEntity(updatedProvider),
      docs: updatedProvider.docs.filter(d => !d.isDeleted)
    };

    return {
      success: true,
      message: 'Updated successfully',
      data: filtered
    }
  }

  async removeCertificate(providerId: string, docId: string): Promise<IResponse<IProvider>> {
    const updatedProvider = await this._providerRepository.findOneAndUpdate(
      {
        _id: providerId,
        'docs._id': docId
      },
      {
        $set: { 'docs.$.isDeleted': true }
      },
      { new: true }
    );

    if (!updatedProvider) {
      throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND, providerId);
    }

    const filtered: IProvider = {
      ...this._providerMapper.toEntity(updatedProvider),
      docs: updatedProvider.docs.filter(d => !d.isDeleted)
    };

    return {
      success: true,
      message: 'Removed successfully',
      data: filtered
    }
  }


  async getReviews(providerId: string): Promise<IResponse> {

    const provider = await this._providerRepository.findById(providerId);
    if (!provider) {
      throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND_WITH_ID, providerId);
    }

    const reviews = provider.reviews;

    if (reviews.length === 0) {
      return {
        success: true,
        message: 'No reviews found'
      }
    }

    const enrichedReviews: IFetchReviews[] = await Promise.all(
      reviews.map(async review => {
        const customer = await this._customerService.findById(review.reviewedBy);

        if (!customer) {
          throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, review.reviewedBy);
        }

        return {
          avatar: customer.avatar,
          name: customer.fullname ?? customer.username,
          avgRating: provider.avgRating,
          writtenAt: review.writtenAt,
          desc: review.desc,
        }
      })
    );

    return {
      success: true,
      message: 'Review Successfully fetched.',
      data: enrichedReviews
    }
  }

  async getWorkImages(providerId: string): Promise<IResponse<string[]>> {
    const workImages = await this._providerRepository.getWorkImages(providerId);
    const urls = workImages.map(imageUrl => this._uploadsUtility.getSignedImageUrl(imageUrl, 5));

    return {
      success: true,
      message: 'Work images fetched successfully',
      data: urls
    }
  }

  async uploadWorkImage(providerId: string, userType: UserType, uploadType: UploadsType, file: Express.Multer.File): Promise<IResponse<string>> {
    const provider = await this._providerRepository.isExists({ _id: providerId });
    if (!provider) {
      throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND_WITH_ID, providerId);
    }

    const uniqueId = uuidv4();
    const publicId = `${userType}/${providerId}/${uploadType}/${uniqueId}`;
    const result = await this._uploadsUtility.uploadsImage(file, publicId);

    if (!result) {
      throw new InternalServerErrorException(ErrorMessage.UPLOAD_FAILED);
    }

    const updatedProvider = await this._providerRepository.addWorkImage(providerId, result.public_id);
    if (!updatedProvider) {
      throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND_WITH_ID, providerId);
    }

    const signedUrl = this._uploadsUtility.getSignedImageUrl(result.public_id, 5);

    return {
      success: true,
      message: 'Image uploaded successfully.',
      data: signedUrl
    }
  }
}

