import { IAdminDashboardOverview, IAdminDashboardRevenue, IAdminDashboardSubscription } from "src/core/entities/interfaces/admin.entity.interface";
import { IResponse } from "src/core/misc/response.util";

export interface IAdminDashboardOverviewService {
    getDashboardOverview(): Promise<IResponse<IAdminDashboardOverview>>;
    getDashBoardRevenue(): Promise<IResponse<IAdminDashboardRevenue[]>>;
    getSubscriptionData(): Promise<IResponse<IAdminDashboardSubscription>>;
}