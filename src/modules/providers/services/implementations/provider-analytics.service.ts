import { BOOKING_REPOSITORY_NAME, REPORT_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IDisputeAnalytics } from "@core/entities/interfaces/report.entity.interface";
import { IBookingPerformanceData, IOnTimeArrivalChartData, IProviderPerformanceOverview, IResponseTimeChartData, IReviewChartData } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { IReportRepository } from "@core/repositories/interfaces/report-repo.interface";
import { IProviderAnalyticsService } from "@modules/providers/services/interfaces/provider-analytics-service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ProviderAnalyticsService implements IProviderAnalyticsService {

    constructor(
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(REPORT_REPOSITORY_NAME)
        private readonly _reportRepository: IReportRepository
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

    async getResponseTimeDistributionData(providerId: string): Promise<IResponse<IResponseTimeChartData[]>> {
        const responseTimeStats = await this._bookingRepository.getResponseDistributionTime(providerId);
        const labels = ["< 1 min", "1–10 min", "10–60 min", "1–24 hrs", "> 1 day"];

        const chartData = responseTimeStats.map((r, i) => ({
            name: labels[i],
            count: r.count
        }));

        return {
            success: true,
            message: 'Response distribution time data fetched successfully.',
            data: chartData
        }
    }

    async getOnTimeArrivalData(providerId: string): Promise<IResponse<IOnTimeArrivalChartData[]>> {
        const onTimeArrivalData = await this._bookingRepository.getOnTimeArrivalData(providerId);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const formattedResult = onTimeArrivalData.map(r => ({
            month: monthNames[r.monthNumber! - 1],
            percentage: Math.round(r.percentage)
        }));

        const fullMonths = monthNames.map(m => ({ month: m, percentage: 0 }));

        const finalResult = fullMonths.map((m) => {
            const data = formattedResult.find(r => r.month === m.month);
            return data ? data : m;
        });

        return {
            success: true,
            message: 'On time arrival data fetched successfully.',
            data: finalResult
        }
    }

    async getMonthlyDisputeStats(providerId: string): Promise<IResponse<IDisputeAnalytics[]>> {
        const disputeStats = await this._reportRepository.getMonthlyDisputeStats(providerId);

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];

        const finalData = disputeStats.map(s => ({
            ...s,
            month: monthNames[s.month - 1]
        }));

        return {
            success: true,
            message: 'Monthly disputes fetched successfully.',
            data: finalData
        }
    }
}  