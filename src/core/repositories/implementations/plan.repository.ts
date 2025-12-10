import { Model } from 'mongoose';
import { PLAN_MODEL_NAME } from '@core/constants/model.constant';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IPlanRepository } from '@core/repositories/interfaces/plans-repo.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PlanDocument } from '@core/schema/plans.schema';
import { ICreatePlan, IPlan } from '@core/entities/interfaces/plans.entity.interface';

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

    async upsertPlan(filter: Partial<IPlan>, data: ICreatePlan): Promise<IPlan | null> {
        return this._planModel.findOneAndUpdate(filter, data, {
            new: true,
            upsert: true
        });
    }

    async findPlan(planId: string): Promise<PlanDocument | null> {
        return this._planModel.findOne({ _id: planId });
    }

    async updatePlan(filter: Partial<IPlan>, updateData: Partial<IPlan>, options?: { new?: boolean }): Promise<PlanDocument | null> {
        return this._planModel.findOneAndUpdate(filter, updateData, options);
    }
}