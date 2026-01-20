import { BaseEntity } from '@core/entities/base/implementation/base.entity';
import { PlanFeatures } from '@core/entities/interfaces/plans.entity.interface';
import { ISubscription } from '@core/entities/interfaces/subscription.entity.interface';
import { ITransaction } from '@core/entities/interfaces/transaction.entity.interface';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { PlanRoleEnum, RenewalEnum, SubsDurationEnum } from '@core/enum/subscription.enum';

export class Subscription extends BaseEntity implements ISubscription {
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

    constructor(partial: Partial<Subscription>) {
        super(partial);
        Object.assign(this, partial);
    }
}