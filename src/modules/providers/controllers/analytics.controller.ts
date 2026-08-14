import { Controller, Get, Inject, Query, Req, UseGuards } from '@nestjs/common';
import { IProviderAnalyticsService } from '@modules/providers/services/interfaces/provider-analytics-service.interface';
import { PROVIDER_ANALYTICS_SERVICE_NAME } from '@core/constants/service.constant';
import { IResponse } from '@core/misc/response.util';
import { Request } from 'express';
import { IPayload } from '@core/misc/payload.interface';
import { IPerformanceAnalyticsBundle, IRevenueAnalyticsBundle } from '@core/entities/interfaces/user.entity.interface';
import { RevenueChartViewDto } from '@modules/providers/dtos/analytics.dto';
import { IAreaAnalyticsBundle, IRevenueTrendData } from '@core/entities/interfaces/booking.entity.interface';
import { AnalyticsGuard } from '@core/guards/analytics.guard';

@UseGuards(AnalyticsGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject(PROVIDER_ANALYTICS_SERVICE_NAME)
    private readonly _analyticService: IProviderAnalyticsService,
  ) {}

  @Get('performance')
  async getPerformanceBundle(@Req() req: Request): Promise<IResponse<IPerformanceAnalyticsBundle>> {
    const user = req.user as IPayload;
    return await this._analyticService.getPerformanceBundle(user.sub);
  }

  @Get('revenue')
  async getRevenueBundle(@Req() req: Request, @Query() { view }: RevenueChartViewDto): Promise<IResponse<IRevenueAnalyticsBundle>> {
    const user = req.user as IPayload;
    return await this._analyticService.getRevenueBundle(user.sub, view);
  }

  @Get('revenue/trend')
  async getRevenueTrend(@Req() req: Request, @Query() { view }: RevenueChartViewDto): Promise<IResponse<IRevenueTrendData>> {
    const user = req.user as IPayload;
    return await this._analyticService.getRevenueTrendOverTime(user.sub, view);
  }

  @Get('area')
  async getAreaBundle(@Req() req: Request): Promise<IResponse<IAreaAnalyticsBundle>> {
    const user = req.user as IPayload;
    return await this._analyticService.getAreaBundle(user.sub);
  }
}
