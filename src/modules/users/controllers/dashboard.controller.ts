import { ADMIN_DASHBOARD_OVERVIEW_SERVICE_NAME } from '@core/constants/service.constant';
import {
    IAdminDashboardOverview, IAdminDashboardRevenue, IAdminDashboardSubscription,
    IAdminDashboardUserStats
} from '@core/entities/interfaces/admin.entity.interface';
import { ITopProviders } from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import {
    IAdminDashboardOverviewService
} from '@modules/users/services/interfaces/admin-dashboard-overview-service.interface';
import { Controller, Get, Inject, InternalServerErrorException } from '@nestjs/common';

@Controller('admin/dashboard')
export class AdminDashboardController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(ADMIN_DASHBOARD_OVERVIEW_SERVICE_NAME)
        private readonly _adminDashboardOverviewService: IAdminDashboardOverviewService
    ) {
        this.logger = this.loggerFactory.createLogger(AdminDashboardController.name);
    }

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
