import { BaseEntity } from '@core/entities/base/implementation/base.entity';
import { ISubscription } from '@core/entities/interfaces/subscription.entity.interface';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { PlanRoleEnum, RenewalEnum, SubsDurationType } from '@core/enum/subscription.enum';

export class Subscription extends BaseEntity implements ISubscription {
    userId: string;
    transactionId: string;
    planId: string;

    name: string;
    duration: SubsDurationType;
    role: PlanRoleEnum;
    features: string[];
    price: number;

    startTime: Date;
    endDate: Date;
    isActive: boolean;
    isDeleted: boolean;

    paymentStatus: PaymentStatus;
    cancelledAt: Date | null;
    renewalType?: RenewalEnum;
    metadata?: Record<string, any>;

    constructor(partial: Partial<Subscription>) {
        super(partial);
        Object.assign(this, partial);
    }
}