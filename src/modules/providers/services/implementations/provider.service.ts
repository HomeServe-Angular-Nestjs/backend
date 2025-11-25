import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { ARGON_UTILITY_NAME, UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { CloudinaryService } from '@configs/cloudinary/cloudinary.service';
import { IDisplayReviews, IFilterFetchProviders, IProvider, IProviderCardView, IProviderCardWithPagination, UserType } from '@core/entities/interfaces/user.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { UploadsType } from '@core/enum/uploads.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IServiceOfferedRepository } from '@core/repositories/interfaces/serviceOffered-repo.interface';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { FilterDto, GetProvidersFromLocationSearch, SlotDto, UpdateBioDto } from '@modules/providers/dtos/provider.dto';
import { IProviderServices } from '@modules/providers/services/interfaces/provider-service.interface';
import { CUSTOMER_MAPPER, PROVIDER_MAPPER, SERVICE_OFFERED_MAPPER } from '@core/constants/mappers.constant';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IReview } from '@core/entities/interfaces/booking.entity.interface';
import { IArgonUtility } from '@core/utilities/interface/argon.utility.interface';
import { IServiceOfferedMapper } from '@core/dto-mapper/interface/serviceOffered.mapper.interface';

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
    private readonly _customerRepository: ICustomerRepository,
    @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
    private readonly _serviceOfferedRepository: IServiceOfferedRepository,
    @Inject(BOOKING_REPOSITORY_NAME)
    private readonly _bookingRepository: IBookingRepository,
    @Inject(UPLOAD_UTILITY_NAME)
    private readonly _uploadsUtility: IUploadsUtility,
    @Inject(PROVIDER_MAPPER)
    private readonly _providerMapper: IProviderMapper,
    @Inject(CUSTOMER_MAPPER)
    private readonly _customerMapper: ICustomerMapper,
    @Inject(ARGON_UTILITY_NAME)
    private readonly _argon: IArgonUtility,
    @Inject(SERVICE_OFFERED_MAPPER)
    private readonly _serviceOfferedMapper: IServiceOfferedMapper,

  ) {
    this.logger = this.loggerFactory.createLogger(ProviderServices.name);
  }

  async getProviders(customerId: string, filters: FilterDto): Promise<IResponse<IProviderCardWithPagination>> {
    const filter: IFilterFetchProviders = {
      status: 'all',
      isCertified: false,
    };

    const limit = 10;
    const page = filters.page || 1;

    if (filters.search) {
      filter.search = filters.search;
    }

    if (filters.status && filters.status !== 'all') {
      filter.status = filters.status;
    }

    if (filters.isCertified) {
      filter.isCertified = filters.isCertified;
    }

    if (filters.status === 'nearest') {
      const customer = await this._customerRepository.findById(customerId);

      if (!customer) {
        throw new NotFoundException({
          code: ErrorCodes.UNAUTHORIZED_ACCESS,
          message: 'Requestor not found'
        });
      }

      const [lng, lat] = customer.location.coordinates;
      filter.lng = lng;
      filter.lat = lat;
    }

    const [providerDocs, totalProviders] = await Promise.all([
      this._providerRepository.fetchProvidersByFilterWithPagination(filter, { page, limit }),
      this._providerRepository.count()
    ]);

    let providers = (providerDocs || []).map(provider => {
      const avatar = provider?.avatar ? this._uploadsUtility.getSignedImageUrl(provider.avatar) : '';
      provider.avatar = avatar;
      return this._providerMapper.toEntity(provider);
    });

    const stats = await this._bookingRepository.getAvgRatingAndTotalReviews();

    const statsMap = stats.reduce((acc, s) => {
      acc[s.providerId] = { avgRating: s.avgRating, totalReviews: s.totalReviews };
      return acc;
    }, {} as Record<string, { avgRating: number, totalReviews: number }>);

    let mappedProviders: IProviderCardView[] = (providers ?? []).map(p => ({
      id: p.id,
      fullname: p.fullname,
      username: p.username,
      avatar: p.avatar,
      address: p.address,
      profession: p.profession,
      experience: p.experience,
      isActive: p.isActive,
      isCertified: p.isCertified,
      ...statsMap[p.id]
    }));

    return {
      success: true,
      message: 'Providers fetched successfully.',
      data: {
        providerCards: mappedProviders,
        pagination: {
          page,
          limit,
          total: totalProviders
        }
      }
    }
  }

  async getProvidersLocationBasedSearch(searchData: GetProvidersFromLocationSearch): Promise<IResponse<IProviderCardWithPagination>> {
    const { page = 1, lng, lat } = searchData;
    const limit = 10;

    const [providerDocs, serviceDocs, totalProviders] = await Promise.all([
      this._providerRepository.getProvidersBasedOnLocation(lng, lat, { page, limit }),
      this._serviceOfferedRepository.searchServiceByTitle(searchData.title),
      this._providerRepository.count(),
    ]);

    const providers = (providerDocs ?? []).map(provider => this._providerMapper.toEntity(provider));
    const services = (serviceDocs ?? []).map(service => this._serviceOfferedMapper.toEntity(service));

    const targetServiceIds = new Set(services.map(service => service.id));

    const searchedProviders = (providers ?? []).filter(provider =>
      provider.servicesOffered.some(id => targetServiceIds.has(id))
    );


    console.log(searchedProviders)
    const stats = await this._bookingRepository.getAvgRatingAndTotalReviews();

    const statsMap = stats.reduce((acc, s) => {
      acc[s.providerId] = { avgRating: s.avgRating, totalReviews: s.totalReviews };
      return acc;
    }, {} as Record<string, { avgRating: number, totalReviews: number }>);

    let mappedProviders: IProviderCardView[] = (searchedProviders ?? []).map(p => ({
      id: p.id,
      fullname: p.fullname,
      username: p.username,
      avatar: p.avatar,
      address: p.address,
      profession: p.profession,
      experience: p.experience,
      isActive: p.isActive,
      isCertified: p.isCertified,
      ...statsMap[p.id]
    }));

    return {
      success: true,
      message: 'Providers successfully fetched.',
      data: {
        providerCards: mappedProviders,
        pagination: {
          page,
          limit,
          total: totalProviders
        }
      }
    }
  }

  async fetchOneProvider(id: string): Promise<IProvider> {
    const providerDoc = await this._providerRepository.findById(id);

    if (!providerDoc) throw new NotFoundException({
      code: ErrorCodes.NOT_FOUND,
      message: 'Provider not found'
    })

    const provider = this._providerMapper.toEntity(providerDoc);
    provider.avatar = provider?.avatar ? this._uploadsUtility.getSignedImageUrl(provider.avatar) : '';
    return provider;
  }

  async bulkUpdateProvider(id: string, updateData: Partial<IProvider>, file?: Express.Multer.File,): Promise<IProvider> {
    if (file) {
      const publicId = this._uploadsUtility.getPublicId('provider', id, UploadsType.USER, uuidv4());
      const ImageResponse = await this._cloudinaryService.uploadsImage(file, publicId);

      if (!ImageResponse) {
        throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
      }
      updateData.avatar = ImageResponse.public_id;
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
      expertise: dto.expertise,
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

    const signedUrl = this._uploadsUtility.getSignedImageUrl(result.public_id, 300);

    return {
      success: true,
      message: 'Image uploaded successfully.',
      data: signedUrl
    }
  }

  async getReviews(providerId: string, count: number = 0): Promise<IResponse<IDisplayReviews>> {
    const [bookingDocs, stats] = await Promise.all([
      this._bookingRepository.findBookingsByProviderId(providerId),
      this._bookingRepository.getAvgRatingAndTotalReviews(providerId)
    ]);

    const customerIds = bookingDocs
      .filter(b => b.review)
      .map(b => b.customerId.toString());

    const uniqueCustomerIds = [...new Set(customerIds)];

    const customerDocs = await this._customerRepository.findByIds(uniqueCustomerIds);
    const customers = (customerDocs ?? []).map(c => this._customerMapper.toEntity(c));

    const customerMap = customers.reduce((acc, c) => {
      acc[c.id] = { username: c.username, avatar: c.avatar, email: c.email };
      return acc;
    }, {} as Record<string, { username: string; avatar: string, email: string }>);

    const statsForProvider = stats[0] ?? { avgRating: 0, totalReviews: 0 };

    const allReviews = bookingDocs.flatMap(b =>
      b.review && b.review.isActive
        ? [{
          ...b.review,
          name: customerMap[b.customerId.toString()]?.username,
          avatar: customerMap[b.customerId.toString()]?.avatar ?? '',
          email: customerMap[b.customerId.toString()]?.email,
          writtenAt: new Date(b.review.writtenAt ?? b.createdAt)
        }]
        : []
    ).sort((a, b) => b.writtenAt.getTime() - a.writtenAt.getTime());

    const limitedReviews = allReviews.slice(0, count + 10);

    const displayReviews: IDisplayReviews = {
      reviews: limitedReviews,
      avgRating: statsForProvider.avgRating,
      totalReviews: statsForProvider.totalReviews,
      allFetched: allReviews.length <= count
    };

    return {
      success: true,
      message: 'Reviews fetched successfully.',
      data: displayReviews
    }
  }

  async updatePassword(providerId: string, currentPassword: string, newPassword: string): Promise<IResponse> {
    const providerDoc = await this._providerRepository.findById(providerId);
    if (!providerDoc) throw new NotFoundException({
      code: ErrorCodes.NOT_FOUND,
      message: 'Provider not found.'
    });

    if (!providerDoc.password) throw new BadRequestException({
      code: ErrorCodes.BAD_REQUEST,
      message: 'This account is signed in using google.'
    });

    const isValidPassword = await this._argon.verify(providerDoc.password, currentPassword);

    if (!isValidPassword) throw new BadRequestException({
      code: ErrorCodes.BAD_REQUEST,
      message: 'Invalid current password.'
    });

    const hashedPassword = await this._argon.hash(newPassword);
    const isPasswordUpdated = await this._providerRepository.updatePasswordById(providerId, hashedPassword);

    return {
      success: isPasswordUpdated,
      message: isPasswordUpdated ? 'Password updated successfully.' : 'Failed to update password.',
    }
  }
}

