import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import { PlanDurationEnum, PlanRoleEnum } from '@core/enum/subscription.enum';
import { FeatureKey } from '@modules/plans/registry/feature.registry';

export type FeatureType = 'boolean' | 'number' | 'enum';
export type FeatureValue = boolean | number | string;
export type PlanFeatures = Partial<Record<FeatureKey, FeatureValue>>;

export interface FeatureDefinition {
    readonly key: string;
    readonly type: FeatureType;
    readonly label?: string;
    readonly values?: readonly string[];
}

export interface IPlan extends IEntity {
    name: string;
    price: number;
    duration: PlanDurationEnum;
    role: PlanRoleEnum;
    features: PlanFeatures;
    isActive: boolean;
    isDeleted: boolean;
}

export type ICreatePlan = Omit<IPlan, keyof IEntity>;
