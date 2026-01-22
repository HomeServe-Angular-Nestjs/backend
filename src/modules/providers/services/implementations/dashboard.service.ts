import { BOOKING_REPOSITORY_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, PROVIDER_SERVICE_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IProviderDashboardOverview } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { IProviderRepository } from "@core/repositories/interfaces/provider-repo.interface";
import { IProviderServiceRepository } from "@core/repositories/interfaces/provider-service-repo.interface";
import { IProviderDashboardService } from "@modules/providers/services/interfaces/dashboard-service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class providerDashboardService implements IProviderDashboardService {
    constructor(
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(PROVIDER_SERVICE_REPOSITORY_NAME)
        private readonly _providerServiceRepository: IProviderServiceRepository,
    ) { }

    async getDashboardOverviewBreakdown(providerId: string): Promise<IResponse<IProviderDashboardOverview>> {
        const [revenue, bookings, avgRating, completionRate, workingHours, activeServiceCount, nextAvailableSlot] = await Promise.all([
            this._bookingRepository.getRevenueBreakdown(providerId),
            this._bookingRepository.getBookingsBreakdown(providerId),
            this._bookingRepository.getAvgRating(providerId),
            this._bookingRepository.getBookingsCompletionRate(providerId),
            this._providerRepository.getWorkingHours(providerId),
            this._providerServiceRepository.count({ providerId, isActive: true }),
            this._bookingRepository.getNextAvailableSlot(providerId)
        ]);

        const response: IProviderDashboardOverview = {
            revenue,
            bookings,
            avgRating,
            nextAvailableSlot,
            workingHours,
            completionRate,
            activeServiceCount
        };

        return {
            success: true,
            message: `Provider dashboard overview breakdown fetched successfully.`,
            data: response,
        }

    }
}