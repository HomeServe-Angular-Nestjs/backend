import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import { PlanRoleType } from '@core/entities/interfaces/plans.entity.interface';
import { SubsPaymentStatus } from '@core/enum/subscription.enum';

export type RenewalType = 'auto' | 'manual';
export type SubsDurationType = 'monthly' | 'yearly';

export interface ISubscription extends IEntity {
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
}