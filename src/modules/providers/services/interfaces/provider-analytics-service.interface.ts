import { RevenueChartView, IAreaAnalyticsBundle, IRevenueTrendData } from "@core/entities/interfaces/booking.entity.interface";
import { IPerformanceAnalyticsBundle, IRevenueAnalyticsBundle } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";

export interface IProviderAnalyticsService {
    getPerformanceBundle(providerId: string): Promise<IResponse<IPerformanceAnalyticsBundle>>;
    getRevenueBundle(providerId: string, view: RevenueChartView): Promise<IResponse<IRevenueAnalyticsBundle>>;
    getRevenueTrendOverTime(providerId: string, view: RevenueChartView): Promise<IResponse<IRevenueTrendData>>;
    getAreaBundle(providerId: string): Promise<IResponse<IAreaAnalyticsBundle>>;
}
