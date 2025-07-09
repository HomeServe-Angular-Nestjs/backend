import { IPlan } from "src/core/entities/interfaces/plans.entity.interface";
import { BaseRepository } from "../base/implementations/base.repository";
import { PlanDocument } from "src/core/schema/plans.schema";
import { InjectModel } from "@nestjs/mongoose";
import { PLAN_MODEL_NAME } from "src/core/constants/model.constant";
import { Model } from "mongoose";
import { Plan } from "src/core/entities/implementation/plans.entity";
import { IPlanRepository } from "../interfaces/plans-repo.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PlanRepository extends BaseRepository<IPlan, PlanDocument> implements IPlanRepository {
    constructor(
        @InjectModel(PLAN_MODEL_NAME)
        private readonly _planmodel: Model<PlanDocument>,
    ) {
        super(_planmodel);
    }

    protected override toEntity(doc: PlanDocument): IPlan {
        return new Plan({
            id: doc.id,
            name: doc.name,
            price: doc.price,
            duration: doc.duration,
            role: doc.role,
            features: doc.features,
            isActive: doc.isActive,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
}