import { Controller, Get, Inject, Req } from "@nestjs/common";
import { IProviderAnalyticsService } from '@modules/providers/services/interfaces/provider-analytics-service.interface';
import { PROVIDER_ANALYTICS_SERVICE_NAME } from "@core/constants/service.constant";
import { IResponse } from "@core/misc/response.util";
import { Request } from "express";
import { IPayload } from "@core/misc/payload.interface";
import { IBookingPerformanceData, IOnTimeArrivalChartData, IProviderPerformanceOverview, IResponseTimeChartData, IReviewChartData } from "@core/entities/interfaces/user.entity.interface";

@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject(PROVIDER_ANALYTICS_SERVICE_NAME)
        private readonly _analyticService: IProviderAnalyticsService,
    ) { }

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
}