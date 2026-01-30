import { IAdminDashboardSubscription } from '@core/entities/interfaces/admin.entity.interface';
import { IAdminSubscriptionList, ISubscriptionFilters } from '@core/entities/interfaces/subscription.entity.interface';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { TransactionDocument } from '@core/schema/bookings.schema';
import { SubscriptionDocument } from '@core/schema/subscription.schema';

export interface ISubscriptionRepository extends IBaseRepository<SubscriptionDocument> {
    getSubscriptionChartData(): Promise<Omit<IAdminDashboardSubscription, 'totalProviders'>>;
    findSubscriptionById(subscriptionId: string): Promise<SubscriptionDocument | null>;
    fetchCurrentActiveSubscription(subscriptionId: string): Promise<SubscriptionDocument | null>;
    count(): Promise<number>;
    findFilteredSubscriptionWithPagination(filters: ISubscriptionFilters, options?: { page?: number, limit?: number }): Promise<IAdminSubscriptionList[]>;
    findActiveSubscriptionByUserId(userId: string, userType: string): Promise<SubscriptionDocument | null>;
    findSubscription(userId: string, userType: string): Promise<SubscriptionDocument | null>;
    updatePaymentStatus(subscriptionId: string, status: PaymentStatus): Promise<boolean>;
    cancelSubscriptionByUserId(userId: string, userType: string): Promise<boolean>;
    removeSubscriptionById(subscriptionId: string): Promise<boolean>;
    createNewTransactionBySubscriptionId(subscriptionId: string, transaction: Partial<TransactionDocument>): Promise<TransactionDocument | null>;
    updateSubscriptionStatus(subscriptionId: string, status: boolean): Promise<boolean>;
}