import { BOOKING_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IBookingPerformanceData, IProviderPerformanceOverview, IReviewChartData } from "@core/entities/interfaces/user.entity.interface";
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

    async getPerformanceTrends(providerId: string): Promise<IResponse<IReviewChartData>> {
        const distributions = await this._bookingRepository.getRatingDistributionsByProviderId(providerId);
        const recentReviews = await this._bookingRepository.getRecentReviews(providerId)

        return {
            success: true,
            message: 'Rating distributions and trends stats fetched successfully',
            data: {
                distributions,
                reviews: recentReviews.map(r => ({
                    name: r.customerId && typeof r.customerId === 'object' && 'username' in r.customerId
                        ? (r.customerId as any).username
                        : 'Unknown',
                    desc: r.review?.desc || '',
                    rating: r.review?.rating || 0,
                }))
            }
        }
    }
}  