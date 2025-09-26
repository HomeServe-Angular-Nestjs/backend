import { IAdminDashboardSubscription } from '@core/entities/interfaces/admin.entity.interface';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { PlanRoleEnum } from '@core/enum/subscription.enum';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { SubscriptionDocument } from '@core/schema/subscription.schema';

export interface ISubscriptionRepository extends IBaseRepository<SubscriptionDocument> {
    getSubscriptionChartData(): Promise<IAdminDashboardSubscription>;
    findSubscriptionById(subscriptionId: string): Promise<SubscriptionDocument | null>;
    findSubscription(userId: string, role: PlanRoleEnum): Promise<SubscriptionDocument | null>;
    updatePaymentStatus(subscriptionId: string, status: PaymentStatus, transactionId: string): Promise<boolean>;
}