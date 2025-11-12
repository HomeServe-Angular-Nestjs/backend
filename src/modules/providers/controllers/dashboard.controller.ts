import { PROVIDER_DASHBOARD_SERVICE_NAME } from "@core/constants/service.constant";
import { IProviderDashboardOverview } from "@core/entities/interfaces/user.entity.interface";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { IProviderDashboardService } from "@modules/providers/services/interfaces/dashboard-service.interface";
import { Controller, Get, Inject, Req } from "@nestjs/common";
import { Request } from "express";

@Controller('provider/dashboard')
export class ProviderDashboardController {
    constructor(
        @Inject(PROVIDER_DASHBOARD_SERVICE_NAME)
        private readonly _dashboardService: IProviderDashboardService
    ) { }

    @Get('overview')
    async getProviderOverviewBreakdown(@Req() req: Request): Promise<IResponse<IProviderDashboardOverview>> {
        const user = req.user as IPayload;
        return await this._dashboardService.getDashboardOverviewBreakdown(user.sub);
    }
}