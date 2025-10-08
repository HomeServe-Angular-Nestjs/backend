import { BOOKING_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IBookingPerformanceData, IProviderPerformanceOverview } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { IProviderAnalyticsService } from "@modules/providers/services/interfaces/provider-analytics-service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ProviderAnalyticsService implements IProviderAnalyticsService {

    constructor(
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
    ) { }

    async getPerformanceAnalytics(providerId: string): Promise<IResponse<IProviderPerformanceOverview>> {
        const performanceStats = await this._bookingRepository.getPerformanceSummary(providerId);
        return {
            success: true,
            message: 'Performance analytic data fetched successfully.',
            data: performanceStats
        }
    }

    async getPerformanceBookingOverview(providerId: string): Promise<IResponse<IBookingPerformanceData[]>> {
        const bookingPerformanceData = await this._bookingRepository.getBookingPerformanceData(providerId);

        return {
            success: true,
            message: 'Booking performance stats fetched successfully',
            data: bookingPerformanceData
        }
    }
}  