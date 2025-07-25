import {
    IAdminDashboardOverview, IAdminDashboardRevenue, IAdminDashboardSubscription,
    IAdminDashboardUserStats
} from '@/core/entities/interfaces/admin.entity.interface';
import { ITopProviders } from '@/core/entities/interfaces/user.entity.interface';
import { IResponse } from '@/core/misc/response.util';

export interface IAdminDashboardOverviewService {
    getDashboardOverview(): Promise<IResponse<IAdminDashboardOverview>>;
    getDashBoardRevenue(): Promise<IResponse<IAdminDashboardRevenue[]>>;
    getSubscriptionData(): Promise<IResponse<IAdminDashboardSubscription>>;
    getUserStatistics(): Promise<IResponse<IAdminDashboardUserStats>>;
    getTopProviders(): Promise<IResponse<ITopProviders[]>>;
}