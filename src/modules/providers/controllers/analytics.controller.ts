import { Controller, Get, Inject } from "@nestjs/common";
import { IProviderAnalyticsService } from '@modules/providers/services/interfaces/provider-analytics-service.interface';
import { PROVIDER_ANALYTICS_SERVICE_NAME } from "@core/constants/service.constant";
import { IResponse } from "@core/misc/response.util";

@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject(PROVIDER_ANALYTICS_SERVICE_NAME)
        private readonly _analyticService: IProviderAnalyticsService,
    ) { }

    @Get('performance_summary')
    async getPerformanceSummary(): Promise<IResponse> {
        return await this._analyticService.getPerformanceAnalytics();
    }
}