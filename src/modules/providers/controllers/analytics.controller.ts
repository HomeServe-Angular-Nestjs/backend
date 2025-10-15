import { Controller, Get, Inject, Query, Req } from "@nestjs/common";
import { IProviderAnalyticsService } from '@modules/providers/services/interfaces/provider-analytics-service.interface';
import { PROVIDER_ANALYTICS_SERVICE_NAME } from "@core/constants/service.constant";
import { IResponse } from "@core/misc/response.util";
import { Request } from "express";
import { IPayload } from "@core/misc/payload.interface";
import { IBookingPerformanceData, IComparisonChartData, IComparisonOverviewData, IOnTimeArrivalChartData, IProviderPerformanceOverview, IProviderRevenueOverview, IResponseTimeChartData, IReviewChartData } from "@core/entities/interfaces/user.entity.interface";
import { IDisputeAnalytics } from "@core/entities/interfaces/report.entity.interface";
import { RevenueChartViewDto } from "@modules/providers/dtos/analytics.dto";
import { IRevenueMonthlyGrowthRateData, IRevenueTrendData } from "@core/entities/interfaces/booking.entity.interface";

@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject(PROVIDER_ANALYTICS_SERVICE_NAME)
        private readonly _analyticService: IProviderAnalyticsService,
    ) { }

    // ------------ Performance Analytics APIs ------------

    @Get('performance/summary')
    async getPerformanceSummary(@Req() req: Request): Promise<IResponse<IProviderPerformanceOverview>> {
        const user = req.user as IPayload;
        return await this._analyticService.getPerformanceAnalytics(user.sub);
    }

    @Get('performance/booking_overview')
    async getPerformanceBookingOverview(@Req() req: Request): Promise<IResponse<IBookingPerformanceData[]>> {
        const user = req.user as IPayload;
        return await this._analyticService.getPerformanceBookingOverview(user.sub);
    }

    @Get('performance/rating_trends')
    async getPerformanceTrends(@Req() req: Request): Promise<IResponse<IReviewChartData>> {
        const user = req.user as IPayload;
        return await this._analyticService.getPerformanceTrends(user.sub);
    }

    @Get('performance/response_time')
    async getResponseTimeDistributionData(@Req() req: Request): Promise<IResponse<IResponseTimeChartData[]>> {
        const user = req.user as IPayload;
        return await this._analyticService.getResponseTimeDistributionData(user.sub);
    }

    @Get('performance/on_time_arrival')
    async getOnTimeArrivalData(@Req() req: Request): Promise<IResponse<IOnTimeArrivalChartData[]>> {
        const user = req.user as IPayload;
        return await this._analyticService.getOnTimeArrivalData(user.sub);
    }

    @Get('performance/monthly_disputes')
    async getMonthlyDisputeStats(@Req() req: Request): Promise<IResponse<IDisputeAnalytics[]>> {
        const user = req.user as IPayload;
        return await this._analyticService.getMonthlyDisputeStats(user.sub);
    }

    @Get('performance/comparison_overview')
    async getComparisonOverviewData(@Req() req: Request): Promise<IResponse<IComparisonOverviewData>> {
        const user = req.user as IPayload;
        return await this._analyticService.getComparisonOverviewData(user.sub);
    }

    @Get('performance/comparison_stats')
    async getComparisonStats(@Req() req: Request): Promise<IResponse<IComparisonChartData[]>> {
        const user = req.user as IPayload;
        return await this._analyticService.getComparisonStats(user.sub);
    }

    // ------------ Revenue Analytics APIs ------------

    @Get('revenue/overview')
    async getRevenueOverview(@Req() req: Request): Promise<IResponse<IProviderRevenueOverview>> {
        const user = req.user as IPayload;
        return await this._analyticService.getRevenueOverview(user.sub);
    }

    @Get('revenue/trends')
    async getRevenueTrendOverTime(@Req() req: Request, @Query() { view }: RevenueChartViewDto): Promise<IResponse<IRevenueTrendData>> {
        const user = req.user as IPayload;
        return await this._analyticService.getRevenueTrendOverTime(user.sub, view);
    }

    @Get('revenue/growth_rate')
    async getMonthlyRevenueGrowthRate(@Req() req: Request): Promise<IResponse<IRevenueMonthlyGrowthRateData[]>> {
        const user = req.user as IPayload;
        return await this._analyticService.getRevenueGrowthByMonth(user.sub);
    }
}