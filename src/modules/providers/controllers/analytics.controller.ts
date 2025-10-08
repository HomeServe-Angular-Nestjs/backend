import { Controller, Get, Inject, Req } from "@nestjs/common";
import { IProviderAnalyticsService } from '@modules/providers/services/interfaces/provider-analytics-service.interface';
import { PROVIDER_ANALYTICS_SERVICE_NAME } from "@core/constants/service.constant";
import { IResponse } from "@core/misc/response.util";
import { Request } from "express";
import { IPayload } from "@core/misc/payload.interface";
import { IProviderPerformanceOverview } from "@core/entities/interfaces/user.entity.interface";

@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject(PROVIDER_ANALYTICS_SERVICE_NAME)
        private readonly _analyticService: IProviderAnalyticsService,
    ) { }

    @Get('performance_summary')
    async getPerformanceSummary(@Req() req: Request): Promise<IResponse<IProviderPerformanceOverview>> {
        const user = req.user as IPayload;
        return await this._analyticService.getPerformanceAnalytics(user.sub);
    }
}