import { IResponse } from "@core/misc/response.util";

export interface IProviderAnalyticsService {
    getPerformanceAnalytics(): Promise<IResponse>
}