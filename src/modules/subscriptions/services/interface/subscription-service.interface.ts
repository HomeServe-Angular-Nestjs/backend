import { IAdminFilteredSubscriptionListWithPagination, ISubscription, ISubscriptionFilters } from '@core/entities/interfaces/subscription.entity.interface';
import { UserType } from '@core/entities/interfaces/user.entity.interface';
import { PlanRoleEnum } from '@core/enum/subscription.enum';
import { IResponse } from '@core/misc/response.util';
import { CreateSubscriptionDto, SubscriptionFiltersDto, UpdatePaymentStatusDto } from '@modules/subscriptions/dto/subscription.dto';

export interface ISubscriptionService {
    createSubscription(userId: string, userType: UserType, createSubscriptionDto: CreateSubscriptionDto): Promise<IResponse<ISubscription>>;
    fetchSubscription(userId: string, role: PlanRoleEnum): Promise<IResponse<ISubscription | null>>;
    getUpgradeAmount(role: UserType, currentSubscriptionId: string): Promise<IResponse<number>>;
    upgradeSubscription(userId: string, userType: UserType, createSubscriptionDto: CreateSubscriptionDto): Promise<IResponse<ISubscription>>;
    updatePaymentStatus(userId: string, userType: UserType, data: UpdatePaymentStatusDto): Promise<IResponse>;
    removeSubscription(subscriptionId: string): Promise<IResponse>;
    hasActiveSubscription(userId: string, role: PlanRoleEnum): Promise<IResponse<ISubscription>>;
    fetchSubscriptionList(filters: SubscriptionFiltersDto): Promise<IResponse<IAdminFilteredSubscriptionListWithPagination>>;
    updateSubscriptionStatus(subscriptionId: string, status: boolean): Promise<IResponse>;
}