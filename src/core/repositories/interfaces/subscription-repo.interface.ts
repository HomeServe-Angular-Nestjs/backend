import type { IAdminDashboardSubscription } from '@core/entities/interfaces/admin.entity.interface';
import type { IAdminSubscriptionList, ISubscriptionFilters } from '@core/entities/interfaces/subscription.entity.interface';
import type { PaymentStatus } from '@core/enum/bookings.enum';
import type { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import type { TransactionDocument } from '@core/schema/bookings.schema';
import type { SubscriptionDocument } from '@core/schema/subscription.schema';

export interface ISubscriptionRepository extends IBaseRepository<SubscriptionDocument> {
  getSubscriptionChartData(): Promise<Omit<IAdminDashboardSubscription, 'totalProviders'>>;
  findSubscriptionById(subscriptionId: string): Promise<SubscriptionDocument | null>;
  findActiveByUserIds(userIds: string[]): Promise<SubscriptionDocument[]>;
  findLatestSubscriptionByUserId(userId: string, userType: string): Promise<SubscriptionDocument | null>;
  fetchCurrentActiveSubscription(subscriptionId: string): Promise<SubscriptionDocument | null>;
  count(): Promise<number>;
  findFilteredSubscriptionWithPagination(
    filters: ISubscriptionFilters,
    options?: { page?: number; limit?: number },
  ): Promise<IAdminSubscriptionList[]>;
  findActiveSubscriptionByUserId(userId: string, userType: string): Promise<SubscriptionDocument | null>;
  findAllSubscriptionsByUserId(userId: string, userType: string): Promise<SubscriptionDocument[]>;
  findSubscription(userId: string, userType: string): Promise<SubscriptionDocument | null>;
  updatePaymentStatus(subscriptionId: string, status: PaymentStatus): Promise<boolean>;
  cancelSubscriptionByUserId(userId: string, userType: string): Promise<boolean>;
  removeSubscriptionById(subscriptionId: string): Promise<boolean>;
  createNewTransactionBySubscriptionId(
    subscriptionId: string,
    transaction: Partial<TransactionDocument>,
  ): Promise<TransactionDocument | null>;
  updateSubscriptionStatus(subscriptionId: string, status: boolean): Promise<boolean>;
}
