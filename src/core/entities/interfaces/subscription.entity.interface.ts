import { SubsPaymentStatus } from "src/core/enum/subscription.enum";
import { IEntity } from "../base/interfaces/base-entity.entity.interface";
import { PlanRoleType } from "./plans.entity.interface";

export type RenewalType = 'auto' | 'manual';
export type SubsDurationType = 'monthly' | 'yearly'

export interface ISubscription extends IEntity {
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
}