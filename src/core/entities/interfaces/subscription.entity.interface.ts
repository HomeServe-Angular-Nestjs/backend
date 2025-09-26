import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { PlanRoleEnum, RenewalEnum, SubsDurationType } from '@core/enum/subscription.enum';

export interface ISubscription extends IEntity {
    userId: string;
    transactionId: string | null;
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
}