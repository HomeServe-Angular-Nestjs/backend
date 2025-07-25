import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';

export type PlanDurationType = 'monthly' | 'yearly' | 'lifetime';
export type PlanRoleType = 'customer' | 'provider';

export interface IPlan extends IEntity {
    name: string;
    price: number;
    duration: PlanDurationType;
    role: PlanRoleType;
    features: string[];
    isActive: boolean;
    isDeleted: boolean;
}