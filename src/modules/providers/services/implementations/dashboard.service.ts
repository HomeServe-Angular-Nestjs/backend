import { BOOKING_REPOSITORY_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME, } from "@core/constants/repository.constant";
import { IProviderDashboardOverview } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { IProviderRepository } from "@core/repositories/interfaces/provider-repo.interface";
import { IServiceOfferedRepository } from "@core/repositories/interfaces/serviceOffered-repo.interface";
import { IProviderDashboardService } from "@modules/providers/services/interfaces/dashboard-service.interface";
import { Inject, Injectable } from "@nestjs/common";

type Slot = { from: Date; to: Date };

@Injectable()
export class providerDashboardService implements IProviderDashboardService {
    constructor(
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private readonly _serviceOfferedRepository: IServiceOfferedRepository,
    ) { }

    async getDashboardOverviewBreakdown(providerId: string): Promise<IResponse<IProviderDashboardOverview>> {
        const [revenue, bookings, avgRating, completionRate, availability, activeServiceCount] = await Promise.all([
            this._bookingRepository.getRevenueBreakdown(providerId),
            this._bookingRepository.getBookingsBreakdown(providerId),
            this._bookingRepository.getAvgRating(providerId),
            this._bookingRepository.getBookingsCompletionRate(providerId),
            this._providerRepository.getWorkingHours(providerId),
            this._serviceOfferedRepository.getActiveServiceCount(providerId)
        ]);



        const response: IProviderDashboardOverview = {
            revenue,
            bookings,
            avgRating,
            nextAvailableSlot: {
                from: '', to: '' //todo-now
            },
            availability,
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