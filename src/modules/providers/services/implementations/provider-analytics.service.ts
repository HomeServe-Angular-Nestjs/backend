import { BOOKING_REPOSITORY_NAME } from "@core/constants/repository.constant";
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

    async getPerformanceAnalytics(): Promise<IResponse> {
        const bookingCompletionRate = await this._bookingRepository.getCompletionRate();

    console.log(bookingCompletionRate)
        return {
            success: true,
            message: 'Performance analytic data fetched successfully.'
        }
    }
}  