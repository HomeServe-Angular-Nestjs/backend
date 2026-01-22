import { Types } from 'mongoose';
import { DateOverrideDocument } from '@core/schema/date-overrides.schema';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY_NAME, CART_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, DATE_OVERRIDES_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, PROVIDER_SERVICE_REPOSITORY_NAME, RESERVATION_REPOSITORY_NAME, SERVICE_CATEGORY_REPOSITORY_NAME, SERVICE_OFFERED_REPOSITORY_NAME, WEEKLY_AVAILABILITY_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { ARGON_UTILITY_NAME, TIME_UTILITY_NAME, UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { CloudinaryService } from '@configs/cloudinary/cloudinary.service';
import { IDisplayReviews, IProvider, IProviderCardView, IProviderCardWithPagination, UserType } from '@core/entities/interfaces/user.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { UploadsType } from '@core/enum/uploads.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IServiceOfferedRepository } from '@core/repositories/interfaces/serviceOffered-repo.interface';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { FilterDto, SlotDto, UpdateBioDto } from '@modules/providers/dtos/provider.dto';
import { IProviderServices } from '@modules/providers/services/interfaces/provider-service.interface';
import { AVAILABILITY_MAPPER, CART_MAPPER, CUSTOMER_MAPPER, PROVIDER_MAPPER, SERVICE_OFFERED_MAPPER } from '@core/constants/mappers.constant';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IArgonUtility } from '@core/utilities/interface/argon.utility.interface';
import { IServiceOfferedMapper } from '@core/dto-mapper/interface/serviceOffered.mapper.interface';
import { AvailabilityEnum } from '@core/enum/slot.enum';
import { IWeeklyAvailabilityRepository } from '@core/repositories/interfaces/weekly-availability-repo.interface';
import { IDateOverridesRepository } from '@core/repositories/interfaces/date-overrides.repo.interface';
import { IReservationRepository } from '@core/repositories/interfaces/reservation-repo.interface';
import { IWeeklyAvailability } from '@core/entities/interfaces/weekly-availability.entity.interface';
import { IAvailabilityMapper } from '@core/dto-mapper/interface/availability.mapper.interface';
import { DateOverride } from '@core/entities/implementation/date-override.entity';
import { ITimeUtility } from '@core/utilities/interface/time.utility.interface';
import { IProviderServiceRepository } from '@core/repositories/interfaces/provider-service-repo.interface';
import { ICartRepository } from '@core/repositories/interfaces/cart-repo.interface';
import { ICartMapper } from '@core/dto-mapper/interface/cart-mapper.interface';
import { IServiceCategoryRepository } from '@core/repositories/interfaces/service-category-repo.interface';

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
    @Inject(WEEKLY_AVAILABILITY_REPOSITORY_INTERFACE_NAME)
    private readonly _availabilityRepository: IWeeklyAvailabilityRepository,
    @Inject(DATE_OVERRIDES_REPOSITORY_INTERFACE_NAME)
    private readonly _dateOverridesRepository: IDateOverridesRepository,
    @Inject(AVAILABILITY_MAPPER)
    private readonly _availabilityMapper: IAvailabilityMapper,
    @Inject(TIME_UTILITY_NAME)
    private readonly _timeUtility: ITimeUtility,
    @Inject(PROVIDER_SERVICE_REPOSITORY_NAME)
    private readonly _providerServiceRepository: IProviderServiceRepository,
    @Inject(CART_REPOSITORY_NAME)
    private readonly _cartRepository: ICartRepository,
    @Inject(CART_MAPPER)
    private readonly _cartMapper: ICartMapper,
    @Inject(RESERVATION_REPOSITORY_NAME)
    private readonly _reservationRepository: IReservationRepository,
  ) {
    this.logger = this.loggerFactory.createLogger(ProviderServices.name);
  }

  private _getTimeDurationWindow(selectedAvailableTime: AvailabilityEnum) {
    switch (selectedAvailableTime) {
      case AvailabilityEnum.MORNING:
        return {
          start: '05:00',
          end: '11:59'
        };
      case AvailabilityEnum.AFTERNOON:
        return {
          start: '12:00',
          end: '16:59'
        };
      case AvailabilityEnum.EVENING:
        return {
          start: '17:00',
          end: '20:59'
        };
      case AvailabilityEnum.NIGHT:
        return {
          start: '21:00',
          end: '04:59'
        };
      default:
        throw new BadRequestException({
          code: ErrorCodes.INVALID_AVAILABILITY_TIME,
          message: 'Invalid availability time'
        });
    }
  }

  // Check if a provider has availability in the requested time window
  private _checkProviderAvailability(week: IWeeklyAvailability['week'], requestedStart: string, requestedEnd: string): boolean {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

    // Check each day of the week
    for (const day of days) {
      const dayAvailability = week[day];

      // Skip if day is not available
      if (!dayAvailability?.isAvailable || !dayAvailability.timeRanges?.length) {
        continue;
      }

      // Check each time range for this day
      for (const timeRange of dayAvailability.timeRanges) {
        if (this._timeRangesOverlap(
          timeRange.startTime,
          timeRange.endTime,
          requestedStart,
          requestedEnd
        )) {
          return true;
        }
      }
    }

    return false;
  }

  // Check if two time ranges overlap
  private _timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const toMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    let start1Min = toMinutes(start1);
    let end1Min = toMinutes(end1);
    let start2Min = toMinutes(start2);
    let end2Min = toMinutes(end2);

    // Handle overnight ranges (e.g., 21:00 to 04:59)
    // If end time is less than start time, it crosses midnight
    if (end1Min < start1Min) {
      end1Min += 24 * 60; // Add 24 hours
    }
    if (end2Min < start2Min) {
      end2Min += 24 * 60; // Add 24 hours
    }

    // Check for overlap
    // Two ranges overlap if: start1 < end2 AND start2 < end1
    return start1Min < end2Min && start2Min < end1Min;
  }

  // Check if a provider is available on a specific date, considering overrides
  private _checkProviderAvailabilityOnDate(
    week: IWeeklyAvailability['week'],
    overrides: DateOverrideDocument[],
    targetDate: Date,
    requestedStart: string,
    requestedEnd: string
  ): boolean {
    const dateString = targetDate.toISOString().split('T')[0];

    // Check for override
    const override = overrides.find(o => {
      const oDate = new Date(o.date).toISOString().split('T')[0];
      return oDate === dateString;
    });

    if (override) {
      if (!override.isAvailable) return false;
      if (!override.timeRanges?.length) return false;

      return override.timeRanges.some(range =>
        this._timeRangesOverlap(range.startTime, range.endTime, requestedStart, requestedEnd)
      );
    }

    // Default to weekly schedule
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
    const dayName = days[targetDate.getDay()];
    const dayAvailability = week[dayName];

    if (!dayAvailability?.isAvailable || !dayAvailability.timeRanges?.length) {
      return false;
    }

    return dayAvailability.timeRanges.some(range =>
      this._timeRangesOverlap(range.startTime, range.endTime, requestedStart, requestedEnd)
    );
  }

  private _isSameDate(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
  }

  private _roundUpToStep(minutes: number, step: number): number {
    return Math.ceil(minutes / step) * step;
  }

  private _isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private _resolveAvailability(selectedDate: Date, weeklyAvailability: IWeeklyAvailability['week'], overrides: DateOverride[]) {
    const override = overrides.find(o =>
      this._isSameDate(new Date(o.date), selectedDate)
    );

    if (override) {
      return override.isAvailable ? override.timeRanges : [];
    }

    const day = selectedDate
      .toLocaleDateString('en-US', { weekday: 'short' })
      .toLowerCase();

    const weeklyDay = weeklyAvailability[day];

    if (!weeklyDay?.isAvailable) return [];

    return weeklyDay.timeRanges;
  }

  private _generateSlotsForRange(
    rangeStartStr: string,
    rangeEndStr: string,
    serviceDuration: number,
    buffer: number,
    unavailable: { start: number; end: number }[],
    stepMinutes = 30,
    selectedDate?: Date
  ): { from: string; to: string; isAvailable: boolean }[] {

    const slots: { from: string; to: string; isAvailable: boolean }[] = [];

    const rangeStart = this._timeUtility.timeToMinutes(rangeStartStr);
    const rangeEnd = this._timeUtility.timeToMinutes(rangeEndStr);

    const totalBusyTime = serviceDuration + buffer;

    let cursor = rangeStart;

    // past-time validation (only for today)
    if (selectedDate && this._isToday(selectedDate)) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const earliestAllowed = this._roundUpToStep(nowMinutes, stepMinutes);

      cursor = Math.max(cursor, earliestAllowed);
    }

    while (cursor + totalBusyTime <= rangeEnd) {
      const slotStart = cursor;
      const slotEnd = slotStart + serviceDuration;
      const slotBusyUntil = slotEnd + buffer;

      const hasCollision = unavailable.some(u =>
        slotStart < u.end && slotBusyUntil > u.start
      );

      if (!hasCollision) {
        slots.push({
          from: this._timeUtility.minutesToTime(slotStart),
          to: this._timeUtility.minutesToTime(slotEnd),
          isAvailable: true
        });
      }

      cursor += stepMinutes;
    }

    return slots;
  }

  async getProviders(filters: FilterDto): Promise<IResponse<IProviderCardWithPagination>> {
    const { page = 1, limit = 10, availability, date, categoryId, ...filter } = filters;

    const [providerDocs, totalProviders] = await Promise.all([
      this._providerRepository.fetchProvidersByFilterWithPagination(filter, { page, limit }),
      this._providerRepository.count(),
    ]);

    let providers: IProvider[] = [];

    providers = (providerDocs || []).map(provider => {
      const avatar = provider?.avatar ? this._uploadsUtility.getSignedImageUrl(provider.avatar) : '';
      provider.avatar = avatar;
      return this._providerMapper.toEntity(provider);
    });

    if (categoryId) {
      const providerIds = new Set();

      const providerServices = await this._providerServiceRepository.findByCategoryId(categoryId);

      for (const services of providerServices) {
        providerIds.add(services.providerId.toString());
      }

      providers = providers.filter(provider => providerIds.has(provider.id));
    }

    // Filter by availability if specified
    if (availability && availability !== 'all') {
      const timeWindow = this._getTimeDurationWindow(availability as AvailabilityEnum);
      const providerIds = providers.map(p => p.id);

      // Fetch weekly availability and overrides for all providers
      const [availabilityDocs, overridesResults] = await Promise.all([
        Promise.all(providerIds.map(id => this._availabilityRepository.findOneByProviderId(id))),
        Promise.all(providerIds.map(id => this._dateOverridesRepository.fetchOverridesByProviderId(id)))
      ]);

      // Create maps for quick lookup
      const availabilityMap = new Map<string, IWeeklyAvailability['week'] | null>();
      const overridesMap = new Map<string, DateOverrideDocument[]>();

      providerIds.forEach((id, index) => {
        availabilityMap.set(id, availabilityDocs[index]?.week || null);
        overridesMap.set(id, overridesResults[index] || []);
      });

      // Filter providers
      providers = providers.filter(p => {
        const week = availabilityMap.get(p.id);
        const overrides = overridesMap.get(p.id) || [];

        if (!week) return false;

        if (date) {
          // Check availability on specific date
          return this._checkProviderAvailabilityOnDate(
            week,
            overrides,
            new Date(date),
            timeWindow.start,
            timeWindow.end
          );
        } else {
          // Check general weekly availability
          return this._checkProviderAvailability(week, timeWindow.start, timeWindow.end);
        }
      });
    }

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
          total: availability && availability !== 'all' ? mappedProviders.length : totalProviders
        }
      }
    }
  }

  // async getProvidersLocationBasedSearch(searchData: GetProvidersFromLocationSearch): Promise<IResponse<IProviderCardWithPagination>> {
  //   const { page = 1, lng, lat } = searchData;
  //   const limit = 10;

  //   const [providerDocs, serviceDocs, totalProviders] = await Promise.all([
  //     this._providerRepository.getProvidersBasedOnLocation(lng, lat, { page, limit }),
  //     this._serviceOfferedRepository.searchServiceByTitle(searchData.title), //todo
  //     this._providerRepository.count(),
  //   ]);

  //   const providers = (providerDocs ?? []).map(provider => this._providerMapper.toEntity(provider));
  //   const services = (serviceDocs ?? []).map(service => this._serviceOfferedMapper.toEntity(service));

  //   const targetServiceIds = new Set(services.map(service => service.id));

  //   const searchedProviders = (providers ?? []).filter(provider =>
  //     provider.servicesOffered.some(id => targetServiceIds.has(id))
  //   );


  //   const stats = await this._bookingRepository.getAvgRatingAndTotalReviews();

  //   const statsMap = stats.reduce((acc, s) => {
  //     acc[s.providerId] = { avgRating: s.avgRating, totalReviews: s.totalReviews };
  //     return acc;
  //   }, {} as Record<string, { avgRating: number, totalReviews: number }>);

  //   let mappedProviders: IProviderCardView[] = (searchedProviders ?? []).map(p => ({
  //     id: p.id,
  //     fullname: p.fullname,
  //     username: p.username,
  //     avatar: p.avatar,
  //     address: p.address,
  //     profession: p.profession,
  //     experience: p.experience,
  //     isActive: p.isActive,
  //     isCertified: p.isCertified,
  //     ...statsMap[p.id]
  //   }));

  //   return {
  //     success: true,
  //     message: 'Providers successfully fetched.',
  //     data: {
  //       providerCards: mappedProviders,
  //       pagination: {
  //         page,
  //         limit,
  //         total: totalProviders
  //       }
  //     }
  //   }
  // }

  async fetchOneProvider(providerId: string): Promise<IProvider> {
    const providerDoc = await this._providerRepository.findById(providerId);

    if (!providerDoc) throw new NotFoundException({
      code: ErrorCodes.NOT_FOUND,
      message: 'Provider not found'
    });

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
    ); //todo

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
    ); //todo

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
    ); //todo

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
    ); //todo

    if (!hasDeleted) {
      throw new Error('Failed to delete default slots');
    }
  }

  async updateBio(providerId: string, updateBioDto: UpdateBioDto): Promise<IResponse<IProvider>> {
    const updateData: Partial<IProvider> = {
      additionalSkills: updateBioDto.additionalSkills,
      expertise: updateBioDto.expertise,
      languages: updateBioDto.languages,
      bio: updateBioDto.providerBio,
    };

    const updatedProvider = await this._providerRepository.findOneAndUpdate(
      { _id: providerId },
      { $set: updateData },
      { new: true }
    ); //todo

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
    ); //todo

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
    ); //todo

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

  async fetchAvailableSlotsByProviderId(customerId: string, providerId: string, selectedDate: Date): Promise<IResponse> {
    const [
      weeklyAvailabilityDocs,
      overrideDocs,
      bufferTime,
      cartDoc,
      bookingDocs,
      reservationDocs
    ] = await Promise.all([
      this._availabilityRepository.findOneByProviderId(providerId),
      this._dateOverridesRepository.fetchOverridesByProviderId(providerId),
      this._providerRepository.getBufferTime(providerId),
      this._cartRepository.findAndPopulateByCustomerId(customerId),
      this._bookingRepository.findAllBookingsByProviderOnSameDate(providerId, selectedDate),
      this._reservationRepository.findAllForDate(providerId, selectedDate)
    ]);

    if (!weeklyAvailabilityDocs) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: 'Weekly availability not found.'
      });
    }

    if (!overrideDocs) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: 'Date overrides not found.'
      });
    }

    if (!cartDoc) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: 'Cart not found.'
      });
    }

    const weeklyAvailability = this._availabilityMapper.toWeeklyAvailabilityEntity(weeklyAvailabilityDocs);
    const dateOverrides = overrideDocs.map(doc => this._availabilityMapper.toDateOverrideEntity(doc));
    const populatedCart = this._cartMapper.toPopulatedEntity(cartDoc);

    const baseRanges = this._resolveAvailability(selectedDate, weeklyAvailability.week, dateOverrides);

    if (!baseRanges.length) {
      return {
        success: true,
        message: 'No available slots',
        data: []
      };
    }

    const totalDurationInMinutes = populatedCart.items.reduce(
      (acc, item) => acc + item.estimatedTimeInMinutes,
      0
    );

    const effectiveBuffer = Math.max(0, bufferTime ?? 0);

    const unavailableIntervals: { start: number; end: number }[] = [];

    // Add bookings to unavailable intervals
    bookingDocs.forEach(b => {
      const start = this._timeUtility.timeToMinutes(b.slot.from);
      const end = this._timeUtility.timeToMinutes(b.slot.to);
      unavailableIntervals.push({ start, end: end + effectiveBuffer });
    });

    // Add reservations to unavailable intervals
    reservationDocs.forEach(r => {
      const start = this._timeUtility.timeToMinutes(r.from);
      const end = this._timeUtility.timeToMinutes(r.to);
      unavailableIntervals.push({ start, end: end + effectiveBuffer });
    });

    unavailableIntervals.sort((a, b) => a.start - b.start);

    const availableSlots = baseRanges.flatMap(range =>
      this._generateSlotsForRange(
        range.startTime,
        range.endTime,
        totalDurationInMinutes,
        effectiveBuffer,
        unavailableIntervals,
        30,
        selectedDate
      )
    );

    return {
      success: true,
      message: 'Available slots fetched successfully.',
      data: availableSlots
    };
  }

  async updateBufferTime(providerId: string, bufferTime: number): Promise<IResponse<IProvider>> {
    const updatedProviderDoc = await this._providerRepository.updateBufferTime(providerId, bufferTime);
    if (!updatedProviderDoc) throw new NotFoundException({
      code: ErrorCodes.NOT_FOUND,
      message: 'Provider not found.'
    });

    return {
      success: true,
      message: 'Buffer time updated successfully.',
      data: this._providerMapper.toEntity(updatedProviderDoc)
    }
  }
}

