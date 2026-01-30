import { Model } from 'mongoose';
import { PLAN_MODEL_NAME } from '@core/constants/model.constant';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IPlanRepository } from '@core/repositories/interfaces/plans-repo.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PlanDocument } from '@core/schema/plans.schema';
import { ICreatePlan, IPlan } from '@core/entities/interfaces/plans.entity.interface';
import { PlanDurationEnum, PlanRoleEnum } from '@core/enum/subscription.enum';

@Injectable()
export class PlanRepository extends BaseRepository<PlanDocument> implements IPlanRepository {
    constructor(
        @InjectModel(PLAN_MODEL_NAME)
        private readonly _planModel: Model<PlanDocument>,
    ) {
        super(_planModel);
    }

    async countDocuments(): Promise<number> {
        return await this._planModel.countDocuments();
    }

    async findPlan(planId: string): Promise<PlanDocument | null> {
        return this._planModel.findOne({ _id: planId, isDeleted: false, isActive: true });
    }

    async updatePlanByPlanId(planId: string, updateData: Partial<IPlan>, options?: { new?: boolean }): Promise<PlanDocument | null> {
        return this._planModel.findOneAndUpdate({ _id: planId }, updateData, options);
    }

    async isPlanExists(filter: { role: string, name: string }): Promise<boolean> {
        return !!(await this._planModel.exists({
            role: filter.role,
            name: filter.name,
            isDeleted: false,
        }));
    }

    async findFreePlan(): Promise<PlanDocument | null> {
        return await this._planModel.findOne({ duration: PlanDurationEnum.Lifetime, isDeleted: false });
    }

    async deletePlan(planId: string): Promise<boolean> {
        const result = await this._planModel.deleteOne({ _id: planId });
        return result.deletedCount > 0;
    }
}