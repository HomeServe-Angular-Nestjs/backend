import { PlanDurationEnum, PlanRoleEnum } from '@core/enum/subscription.enum';
import { BaseEntity } from '../base/implementation/base.entity';
import { IPlan, PlanFeatures } from '../interfaces/plans.entity.interface';

export class Plan extends BaseEntity implements IPlan {
    name: string;
    price: number;
    duration: PlanDurationEnum;
    role: PlanRoleEnum;
    features: PlanFeatures;
    isActive: boolean;
    isDeleted: boolean;

    constructor(partial: Partial<Plan>) {
        super(partial);
        Object.assign(this, partial);
    }
}