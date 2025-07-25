import { BaseEntity } from '../base/implementation/base.entity';
import { IPlan, PlanDurationType, PlanRoleType } from '../interfaces/plans.entity.interface';

export class Plan extends BaseEntity implements IPlan {
    name: string;
    price: number;
    duration: PlanDurationType;
    role: PlanRoleType;
    features: string[];
    isActive: boolean;
    isDeleted: boolean;

    constructor(partial: Partial<Plan>) {
        super(partial);
        Object.assign(this, partial);
    }
}