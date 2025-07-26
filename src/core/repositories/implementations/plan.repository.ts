import { Model } from 'mongoose';

import { PLAN_MODEL_NAME } from '@core/constants/model.constant';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IPlanRepository } from '@core/repositories/interfaces/plans-repo.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PlanDocument } from '@core/schema/plans.schema';

@Injectable()
export class PlanRepository extends BaseRepository<PlanDocument> implements IPlanRepository {
    constructor(
        @InjectModel(PLAN_MODEL_NAME)
        private readonly _planModel: Model<PlanDocument>,
    ) {
        super(_planModel);
    }
}