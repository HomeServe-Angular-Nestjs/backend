import { RenewalType, SubsDurationType, SubsPaymentStatus } from "src/core/enum/subscription.enum";
import { BaseEntity } from "../base/implementation/base.entity";
import { PlanRoleType } from "../interfaces/plans.entity.interface";
import { ISubscription } from "../interfaces/subscription.entity.interface";

export class Subscription extends BaseEntity implements ISubscription {
    userId: string;
    transactionId: string;
    planId: string;

    name: string;
    duration: SubsDurationType;
    role: PlanRoleType;
    features: string[];

    startTime: string;
    endDate: string;
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