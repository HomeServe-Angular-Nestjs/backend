import { IProviderDashboardOverview } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";

export interface IProviderDashboardService {
    getDashboardOverviewBreakdown(providerId: string): Promise<IResponse<IProviderDashboardOverview>>;
}