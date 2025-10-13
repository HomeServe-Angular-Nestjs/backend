import { IDisputeAnalytics } from "@core/entities/interfaces/report.entity.interface";
import { IBookingPerformanceData, IComparisonChartData, IComparisonOverviewData, IOnTimeArrivalChartData, IProviderPerformanceOverview, IResponseTimeChartData, IReviewChartData } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";

export interface IProviderAnalyticsService {
    getPerformanceAnalytics(providerId: string): Promise<IResponse<IProviderPerformanceOverview>>;
    getPerformanceBookingOverview(providerId: string): Promise<IResponse<IBookingPerformanceData[]>>;
    getPerformanceTrends(providerId: string): Promise<IResponse<IReviewChartData>>;
    getResponseTimeDistributionData(providerId: string): Promise<IResponse<IResponseTimeChartData[]>>;
    getOnTimeArrivalData(providerId: string): Promise<IResponse<IOnTimeArrivalChartData[]>>;
    getMonthlyDisputeStats(providerId: string): Promise<IResponse<IDisputeAnalytics[]>>;
    getComparisonOverviewData(providerId: string): Promise<IResponse<IComparisonOverviewData>>;
    getComparisonStats(providerId: string): Promise<IResponse<IComparisonChartData[]>>;

}