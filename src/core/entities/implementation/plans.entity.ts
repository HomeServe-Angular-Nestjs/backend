import { PlanRoleEnum } from '@core/enum/subscription.enum';
import { BaseEntity } from '../base/implementation/base.entity';
import { IPlan, PlanDurationType } from '../interfaces/plans.entity.interface';

export class Plan extends BaseEntity implements IPlan {
    name: string;
    price: number;
    duration: PlanDurationType;
    role: PlanRoleEnum;
    features: string[];
    isActive: boolean;
    isDeleted: boolean;

    constructor(partial: Partial<Plan>) {
        super(partial);
        Object.assign(this, partial);
    }
}