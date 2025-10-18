import { RevenueChartView, IRevenueTrendData, IRevenueMonthlyGrowthRateData, IRevenueCompositionData, ITopServicesByRevenue, INewOrReturningClientData, IAreaSummary, IServiceDemandData, ILocationRevenue, ITopAreaRevenue, IUnderperformingArea, IPeakServiceTime } from "@core/entities/interfaces/booking.entity.interface";
import { IDisputeAnalytics } from "@core/entities/interfaces/report.entity.interface";
import { IBookingPerformanceData, IComparisonChartData, IComparisonOverviewData, IOnTimeArrivalChartData, IProviderPerformanceOverview, IProviderRevenueOverview, IResponseTimeChartData, IReviewChartData } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";

export interface IProviderAnalyticsService {
    // ------------ Performance Analytics APIs ------------
    getPerformanceAnalytics(providerId: string): Promise<IResponse<IProviderPerformanceOverview>>;
    getPerformanceBookingOverview(providerId: string): Promise<IResponse<IBookingPerformanceData[]>>;
    getPerformanceTrends(providerId: string): Promise<IResponse<IReviewChartData>>;
    getResponseTimeDistributionData(providerId: string): Promise<IResponse<IResponseTimeChartData[]>>;
    getOnTimeArrivalData(providerId: string): Promise<IResponse<IOnTimeArrivalChartData[]>>;
    getMonthlyDisputeStats(providerId: string): Promise<IResponse<IDisputeAnalytics[]>>;
    getComparisonOverviewData(providerId: string): Promise<IResponse<IComparisonOverviewData>>;
    getComparisonStats(providerId: string): Promise<IResponse<IComparisonChartData[]>>;

    // ------------ Revenue Analytics APIs ------------

    getRevenueOverview(providerId: string): Promise<IResponse<IProviderRevenueOverview>>;
    getRevenueTrendOverTime(providerId: string, view: RevenueChartView): Promise<IResponse<IRevenueTrendData>>;
    getRevenueGrowthByMonth(providerId: string): Promise<IResponse<IRevenueMonthlyGrowthRateData[]>>;
    getRevenueCompositionData(providerId: string): Promise<IResponse<IRevenueCompositionData[]>>;
    getTopServicesByRevenue(providerId: string): Promise<IResponse<ITopServicesByRevenue[]>>;
    getNewAndReturningClientData(providerId: string): Promise<IResponse<INewOrReturningClientData[]>>;

    // ------------ Area Analytics APIs ------------

    getAreaSummaryData(providerId: string): Promise<IResponse<IAreaSummary>>;
    getServiceDemandData(providerId: string): Promise<IResponse<IServiceDemandData[]>>;
    getServiceDemandByLocation(providerId: string): Promise<IResponse<ILocationRevenue[]>>;
    getTopAreasRevenue(providerId: string): Promise<IResponse<ITopAreaRevenue[]>>;
    getUnderperformingAreas(providerId: string): Promise<IResponse<IUnderperformingArea[]>>;
    getPeakServiceTime(providerId: string): Promise<IResponse<IPeakServiceTime[]>>;
}