import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import { PlanRoleEnum } from '@core/enum/subscription.enum';

export type PlanDurationType = 'monthly' | 'yearly' | 'lifetime';

export interface IPlan extends IEntity {
    name: string;
    price: number;
    duration: PlanDurationType;
    role: PlanRoleEnum;
    features: string[];
    isActive: boolean;
    isDeleted: boolean;
}

export type ICreatePlan = Omit<IPlan, keyof IEntity>;