import { Controller, Get, Inject, InternalServerErrorException } from "@nestjs/common";
import { ErrorMessage } from "src/core/enum/error.enum";
import { CustomLogger } from "src/core/logger/custom-logger";
import { IAdminDashboardOverviewService } from "../services/interfaces/admin-dashboard-overview-service.interface";
import { ADMIN_DASHBOARD_OVERVIEW_SERVICE_NAME } from "src/core/constants/service.constant";
import { IAdminDashboardOverview, IAdminDashboardRevenue, IAdminDashboardSubscription, IAdminDashboardUserStats } from "src/core/entities/interfaces/admin.entity.interface";
import { IResponse } from "src/core/misc/response.util";
import { ITopProviders } from "src/core/entities/interfaces/user.entity.interface";

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

    @Get('subscription')
    async getSubscriptionData(): Promise<IResponse<IAdminDashboardSubscription>> {
        try {
            return this._adminDashboardOverviewService.getSubscriptionData();
        } catch (err) {
            this.logger.error('Error fetching subscription data', err, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('user_stats')
    async getUserStatistics(): Promise<IResponse<IAdminDashboardUserStats>> {
        try {
            return this._adminDashboardOverviewService.getUserStatistics();
        } catch (err) {
            this.logger.error('Error fetching user statistics', err, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('top_providers')
    async getTopProviders(): Promise<IResponse<ITopProviders[]>> {
        try {
            return this._adminDashboardOverviewService.getTopProviders();
        } catch (err) {
            this.logger.error('Error fetching top providers', err, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
