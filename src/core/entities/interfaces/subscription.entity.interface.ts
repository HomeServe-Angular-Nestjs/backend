import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import { IPagination } from '@core/entities/interfaces/booking.entity.interface';
import { PlanFeatures } from '@core/entities/interfaces/plans.entity.interface';
import { ITransaction } from '@core/entities/interfaces/transaction.entity.interface';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { PlanRoleEnum, RenewalEnum, SubsDurationEnum } from '@core/enum/subscription.enum';

export type SubscriptionStatusType = 'active' | 'expired' | 'inactive';

export interface ISubscription extends IEntity {
    userId: string;
    planId: string;
    name: string;
    duration: SubsDurationEnum;
    role: PlanRoleEnum;
    features: PlanFeatures;
    price: number;
    startTime: Date;
    endDate: Date;
    isActive: boolean;
    isDeleted: boolean;
    paymentStatus: PaymentStatus;
    cancelledAt: Date | null;
    transactionHistory: ITransaction[];
    renewalType?: RenewalEnum;
    metadata?: Record<string, any>;
}

export interface IAdminSubscriptionList {
    subscriptionId: string;
    user: {
        email: string;
        role: 'provider' | 'customer';
    };
    plan: {
        name: string;
        duration: SubsDurationEnum;
    };
    amount: number;
    status: SubscriptionStatusType;
    isActive: boolean;
    paymentStatus: PaymentStatus;
    validity: {
        start: string;
        end: string;
    };
    renewalType?: RenewalEnum;
}

export interface IAdminFilteredSubscriptionListWithPagination {
    subscriptions: IAdminSubscriptionList[];
    pagination: IPagination;
}

export interface ISubscriptionFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: SubscriptionStatusType | 'all';
    payment?: PaymentStatus | 'all';
    duration?: SubsDurationEnum | 'all';
}