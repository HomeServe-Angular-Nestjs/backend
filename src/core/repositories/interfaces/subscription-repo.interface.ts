import { IAdminDashboardSubscription } from '@core/entities/interfaces/admin.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { SubscriptionDocumentType } from '@core/schema/subscription.schema';

export interface ISubscriptionRepository extends IBaseRepository<SubscriptionDocumentType> {
    getSubscriptionChartData(): Promise<IAdminDashboardSubscription>;
}