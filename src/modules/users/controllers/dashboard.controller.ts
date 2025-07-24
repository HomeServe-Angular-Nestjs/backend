import { Controller, Get, Inject, InternalServerErrorException } from "@nestjs/common";
import { ErrorMessage } from "src/core/enum/error.enum";
import { CustomLogger } from "src/core/logger/custom-logger";
import { IAdminDashboardOverviewService } from "../services/interfaces/admin-dashboard-overview-service.interface";
import { ADMIN_DASHBOARD_OVERVIEW_SERVICE_NAME } from "src/core/constants/service.constant";
import { IAdminDashboardOverview, IAdminDashboardRevenue } from "src/core/entities/interfaces/admin.entity.interface";
import { IResponse } from "src/core/misc/response.util";

@Controller('admin/dashboard')
export class AdminDashboardController {
    private readonly logger = new CustomLogger(AdminDashboardController.name);

    constructor(
        @Inject(ADMIN_DASHBOARD_OVERVIEW_SERVICE_NAME)
        private readonly _adminDashboardOverviewService: IAdminDashboardOverviewService
    ) { }

    @Get('overview')
    async getDashboardOverview(): Promise<IResponse<IAdminDashboardOverview>> {
        try {
            return this._adminDashboardOverviewService.getDashboardOverview();
        } catch (err) {
            this.logger.error('Error fetching dashboard overview', err, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }
    @Get('revenue')
    async getRevenueData(): Promise<IResponse<IAdminDashboardRevenue[]>> {
        try {
            return this._adminDashboardOverviewService.getDashBoardRevenue();
        } catch (err) {
            this.logger.error('Error fetching dashboard overview', err, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }
}
