import { IBookingPerformanceData, IProviderPerformanceOverview, IResponseTimeChartData, IReviewChartData } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";

export interface IProviderAnalyticsService {
    getPerformanceAnalytics(providerId: string): Promise<IResponse<IProviderPerformanceOverview>>;
    getPerformanceBookingOverview(providerId: string): Promise<IResponse<IBookingPerformanceData[]>>;
    getPerformanceTrends(providerId: string): Promise<IResponse<IReviewChartData>>;
    getResponseTimeDistributionData(providerId: string): Promise<IResponse<IResponseTimeChartData[]>>;

}