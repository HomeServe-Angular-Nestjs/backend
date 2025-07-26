import { Model } from 'mongoose';

import { PLAN_MODEL_NAME } from '@core/constants/model.constant';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IPlanRepository } from '@core/repositories/interfaces/plans-repo.interface';
import { PlanDocumentType } from '@core/schema/plans.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PlanRepository extends BaseRepository<PlanDocumentType> implements IPlanRepository {
    constructor(
        @InjectModel(PLAN_MODEL_NAME)
        private readonly _planModel: Model<PlanDocumentType>,
    ) {
        super(_planModel);
    }

    // protected override toEntity(doc: PlanDocumentType): IPlan {
    //     return new Plan({
    //         id: doc.id,
    //         name: doc.name,
    //         price: doc.price,
    //         duration: doc.duration,
    //         role: doc.role,
    //         features: doc.features,
    //         isActive: doc.isActive,
    //         isDeleted: doc.isDeleted,
    //         createdAt: doc.createdAt,
    //         updatedAt: doc.updatedAt,
    //     });
    // }
}