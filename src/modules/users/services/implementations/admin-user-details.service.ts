import {
    BOOKING_REPOSITORY_NAME,
    CUSTOMER_REPOSITORY_INTERFACE_NAME,
    DATE_OVERRIDES_REPOSITORY_INTERFACE_NAME,
    PROVIDER_REPOSITORY_INTERFACE_NAME,
    PROVIDER_SERVICE_REPOSITORY_NAME,
    WEEKLY_AVAILABILITY_REPOSITORY_INTERFACE_NAME,
} from '@/core/constants/repository.constant';
import { CUSTOMER_MAPPER, PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import { UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import {
    IAddressDetail,
    IAvailabilityOverview,
    ICustomerDetailsBundle,
    IProviderDetailsBundle,
    IProviderDetailsProfile,
    IProviderServiceOverview,
} from '@core/entities/interfaces/admin-user-details.entity.interface';
import { ErrorCodes } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IDateOverridesRepository } from '@core/repositories/interfaces/date-overrides.repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IProviderServiceRepository } from '@core/repositories/interfaces/provider-service-repo.interface';
import { IWeeklyAvailabilityRepository } from '@core/repositories/interfaces/weekly-availability-repo.interface';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { IAdminUserDetailsService } from '@modules/users/services/interfaces/admin-user-details-service.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { ProviderServicePopulatedDocument } from '@core/schema/provider-service.schema';

@Injectable()
export class AdminUserDetailsService implements IAdminUserDetailsService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(PROVIDER_SERVICE_REPOSITORY_NAME)
        private readonly _providerServiceRepository: IProviderServiceRepository,
        @Inject(WEEKLY_AVAILABILITY_REPOSITORY_INTERFACE_NAME)
        private readonly _weeklyAvailabilityRepository: IWeeklyAvailabilityRepository,
        @Inject(DATE_OVERRIDES_REPOSITORY_INTERFACE_NAME)
        private readonly _dateOverridesRepository: IDateOverridesRepository,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadUtility: IUploadsUtility,
    ) {
        this.logger = this.loggerFactory.createLogger(AdminUserDetailsService.name);
    }

    async getCustomerDetails(customerId: string): Promise<{ success: boolean; message: string; data: ICustomerDetailsBundle }> {
        const customerDoc = await this._customerRepository.findById(customerId);
        if (!customerDoc) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Customer not found.',
            });
        }

        const customer = this._customerMapper.toEntity(customerDoc);

        const [statistics, recentBookings, reviews] = await Promise.all([
            this._bookingRepository.getCustomerStatistics(customerId),
            this._bookingRepository.getRecentBookingsByCustomer(customerId, 5),
            this._bookingRepository.getRecentReviewsByCustomer(customerId, 5),
        ]);

        const addresses: IAddressDetail[] = [{
            label: 'Home',
            address: customer.address || '',
            coordinates: customer.location?.coordinates,
            isDefault: true,
        }];

        const bundle: ICustomerDetailsBundle = {
            profile: {
                id: customer.id,
                username: customer.username,
                fullname: customer.fullname ?? customer.username,
                email: customer.email,
                phone: customer.phone,
                avatar: this._uploadUtility.getSignedImageUrl(customer.avatar),
                isActive: customer.isActive,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
            },
            statistics: {
                totalBookings: statistics.totalBookings,
                completedBookings: statistics.completedBookings,
                cancelledBookings: statistics.cancelledBookings,
                totalAmountSpent: +(statistics.totalAmountSpent / 100).toFixed(2),
                reviewsWritten: statistics.reviewsWritten,
            },
            addresses,
            recentBookings,
            reviews,
        };

        return {
            success: true,
            message: 'Customer details fetched.',
            data: bundle,
        };
    }

    async getProviderDetails(providerId: string): Promise<{ success: boolean; message: string; data: IProviderDetailsBundle }> {
        const providerDoc = await this._providerRepository.findById(providerId);
        if (!providerDoc) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Provider not found.',
            });
        }

        const provider = this._providerMapper.toEntity(providerDoc);

        const [
            statistics,
            avgRatingResult,
            services,
            serviceBookingCounts,
            weeklyAvailability,
            dateOverrides,
            recentBookings,
            reviews,
            activeServiceCount,
        ] = await Promise.all([
            this._bookingRepository.getProviderStatistics(providerId),
            this._bookingRepository.getAvgRatingAndTotalReviews(providerId),
            this._providerServiceRepository.findAllAndPopulateByProviderId(providerId, {}, { page: 1, limit: 200 }),
            this._bookingRepository.getServiceBookingCounts(providerId),
            this._weeklyAvailabilityRepository.findByProviderId(providerId),
            this._dateOverridesRepository.fetchOverridesByProviderId(providerId),
            this._bookingRepository.getRecentBookingsByProvider(providerId, 5),
            this._bookingRepository.getRecentReviewsByProvider(providerId, 5),
            this._providerServiceRepository.count({ providerId, isActive: true }),
        ]);

        const bookingCountMap = new Map(serviceBookingCounts.map(entry => [entry.serviceId, entry.count]));

        const serviceOverview: IProviderServiceOverview[] = services.services.map((service: ProviderServicePopulatedDocument) => ({
            serviceId: (service as any)._id?.toString() ?? (service as any).id,
            service: (service as any).professionId?.name ?? '',
            category: (service as any).categoryId?.name ?? '',
            price: (service as any).price ?? 0,
            pricingUnit: (service as any).pricingUnit ?? 'hour',
            isActive: (service as any).isActive ?? false,
            totalBookings: bookingCountMap.get((service as any)._id?.toString()) ?? 0,
        }));

        const week = weeklyAvailability[0]?.week;
        const availability: IAvailabilityOverview = {
            days: this._buildDayAvailability(week),
            vacation: this._buildVacation(dateOverrides),
        };

        const documents = (provider.docs ?? [])
            .filter(doc => !doc.isDeleted)
            .map(doc => ({
                id: doc.id,
                label: doc.label,
                fileUrl: this._uploadUtility.getSignedImageUrl(doc.fileUrl),
                uploadedAt: doc.uploadedAt,
                verificationStatus: doc.verificationStatus,
            }));

        const avgRating = avgRatingResult?.[0]?.avgRating ?? 0;
        const totalReviews = avgRatingResult?.[0]?.totalReviews ?? 0;

        const profile: IProviderDetailsProfile = {
            id: provider.id,
            username: provider.username,
            fullname: provider.fullname ?? provider.username,
            email: provider.email,
            phone: provider.phone,
            avatar: this._uploadUtility.getSignedImageUrl(provider.avatar),
            isActive: provider.isActive,
            createdAt: provider.createdAt,
            updatedAt: provider.updatedAt,
            profession: provider.profession,
            experience: provider.experience,
            bio: provider.bio,
            verificationStatus: provider.verificationStatus,
        };

        const bundle: IProviderDetailsBundle = {
            profile,
            statistics: {
                activeServices: activeServiceCount,
                totalBookings: statistics.totalBookings,
                completedJobs: statistics.completedJobs,
                cancelledJobs: statistics.cancelledJobs,
                totalRevenue: +(statistics.totalRevenue / 100).toFixed(2),
                averageRating: avgRating,
                totalReviews,
            },
            services: serviceOverview,
            availability,
            documents,
            recentBookings,
            reviews,
        };

        return {
            success: true,
            message: 'Provider details fetched.',
            data: bundle,
        };
    }

    private _buildDayAvailability(week: any): IAvailabilityOverview['days'] {
        const order = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
        return order.map(day => {
            const dayInfo = week?.[day];
            return {
                day,
                isAvailable: dayInfo?.isAvailable ?? false,
                timeRanges: dayInfo?.timeRanges ?? [],
            };
        });
    }

    private _buildVacation(overrides: any[]): IAvailabilityOverview['vacation'] {
        const days = (overrides ?? [])
            .filter(override => override.isAvailable === false)
            .map(override => ({
                date: override.date,
                reason: override.reason,
            }));

        return {
            isOnVacation: days.length > 0,
            days,
        };
    }
}