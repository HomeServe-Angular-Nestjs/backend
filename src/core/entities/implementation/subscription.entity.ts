import { BaseEntity } from '@core/entities/base/implementation/base.entity';
import { PlanRoleType } from '@core/entities/interfaces/plans.entity.interface';
import {
    ISubscription, RenewalType, SubsDurationType
} from '@core/entities/interfaces/subscription.entity.interface';
import { SubsPaymentStatus } from '@core/enum/subscription.enum';

export class Subscription extends BaseEntity implements ISubscription {
    userId: string;
    transactionId: string;
    planId: string;

    name: string;
    duration: SubsDurationType;
    role: PlanRoleType;
    features: string[];

    startTime: string;
    endDate: string | null;
    isActive: boolean;
    isDeleted: boolean;

    renewalType?: RenewalType;
    paymentStatus?: SubsPaymentStatus;
    cancelledAt?: string;
    metadata?: Record<string, any>;

    constructor(partial: Partial<Subscription>) {
        super(partial);
        Object.assign(this, partial);
    }
}