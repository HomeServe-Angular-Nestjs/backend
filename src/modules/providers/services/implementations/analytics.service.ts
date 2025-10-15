import { BOOKING_REPOSITORY_NAME, REPORT_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { RevenueChartView, IRevenueTrendData, IRevenueMonthlyGrowthRateData,IRevenueCompositionData, ITopServicesByRevenue } from "@core/entities/interfaces/booking.entity.interface";
import { IDisputeAnalytics } from "@core/entities/interfaces/report.entity.interface";
import { IBookingPerformanceData, IComparisonChartData, IComparisonOverviewData, IOnTimeArrivalChartData, IProviderPerformanceOverview, IProviderRevenueOverview, IResponseTimeChartData, IReviewChartData } from "@core/entities/interfaces/user.entity.interface";
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

    private _getMonths(): string[] {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }

    // ------------ Performance Analytics Services ------------

    async getPerformanceAnalytics(providerId: string): Promise<IResponse<IProviderPerformanceOverview>> {
        return {
            success: true,
            message: 'Performance analytic data fetched successfully.',
            data: await this._bookingRepository.getPerformanceSummary(providerId)
        }
    }

    async getPerformanceBookingOverview(providerId: string): Promise<IResponse<IBookingPerformanceData[]>> {
        return {
            success: true,
            message: 'Booking performance stats fetched successfully',
            data: await this._bookingRepository.getBookingPerformanceData(providerId)
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

        const monthNames = this._getMonths();

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

        const monthNames = this._getMonths();

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

    async getComparisonOverviewData(providerId: string): Promise<IResponse<IComparisonOverviewData>> {
        return {
            success: true,
            message: "Comparison overview data fetched successfully.",
            data: await this._bookingRepository.getComparisonOverviewData(providerId)
        }
    }

    async getComparisonStats(providerId: string): Promise<IResponse<IComparisonChartData[]>> {
        const rawData = await this._bookingRepository.getComparisonData(providerId);

        const monthNames = this._getMonths();

        const fullYearData: IComparisonChartData[] =
            Array.from({ length: 12 }, (_, i) => {
                const month = monthNames[i];
                const existing = rawData.find(d => d.month === i + 1);
                return existing
                    ? { month, performance: existing.performance, platformAvg: existing.platformAvg }
                    : { month, performance: 0, platformAvg: 0 };
            });

        return {
            success: true,
            message: "Comparison stats data fetched successfully.",
            data: fullYearData
        }
    }

    // ------------ Revenue Analytics Services ------------

    async getRevenueOverview(providerId: string): Promise<IResponse<IProviderRevenueOverview>> {
        return {
            success: true,
            message: 'Revenue overview data fetched successfully.',
            data: await this._bookingRepository.getRevenueOverview(providerId)
        }
    }

    async getRevenueTrendOverTime(providerId: string, view: RevenueChartView): Promise<IResponse<IRevenueTrendData>> {
        const raw = await this._bookingRepository.getRevenueTrendOverTime(providerId, view);

        const { providerRevenue, platformAvg } = raw;

        const monthLabels = this._getMonths();
        const quarterLabels = ["Q1", "Q2", "Q3", "Q4"];

        let labels: string[] = [];
        if (view === 'monthly') labels = monthLabels;
        else if (view === 'quarterly') labels = quarterLabels;
        else if (view === 'yearly') {
            const allYears = [...providerRevenue, ...platformAvg].map(d => Number(d.label));
            let labelsSet = new Set(allYears);

            // If only one year exists, add the previous year with zero
            if (labelsSet.size === 1) {
                const year = [...labelsSet][0];
                labelsSet.add(year - 1);
            }

            labels = Array.from(labelsSet).sort((a, b) => a - b).map(String);
        }

        const mapValue = (arr, label) => {
            const item = arr.find(d => d.label === label);
            return item?.totalRevenue || 0;
        }

        const userRevenue = labels.map(l => mapValue(providerRevenue, l));
        const platformAverage = labels.map(l => mapValue(platformAvg, l));

        return {
            success: true,
            message: 'Revenue overview data fetched successfully.',
            data: { labels, providerRevenue: userRevenue, platformAvg: platformAverage }
        }
    }

    async getRevenueGrowthByMonth(providerId: string): Promise<IResponse<IRevenueMonthlyGrowthRateData[]>> {
        const result = await this._bookingRepository.getRevenueGrowthByMonth(providerId);
        const monthNames = this._getMonths();

        const final = Array.from({ length: 12 }, (_, i) => {
            const month = monthNames[i];
            const existing = result.find(r => r.month === i + 1);
            return existing ? { ...existing, month } : { month, totalRevenue: 0, growthRate: 0 };
        });

        return {
            success: true,
            message: 'Monthly revenue growth rate data fetched successfully.',
            data: final
        }
    }

    async getRevenueCompositionData(providerId: string): Promise<IResponse<IRevenueCompositionData[]>> {
        return {
            success: true,
            message: 'Revenue composition data fetched successfully.',
            data: await this._bookingRepository.getRevenueCompositionByServiceCategory(providerId)
        }
    }
   
    async getTopServicesByRevenue(providerId: string): Promise<IResponse<ITopServicesByRevenue[]>> {
        return {
            success: true,
            message: 'Top service data fetched successfully.',
            data: await this._bookingRepository.getTopTenServicesByRevenue(providerId)
        }
    }
}  