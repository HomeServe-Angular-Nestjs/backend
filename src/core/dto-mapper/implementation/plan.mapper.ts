import { IPlanMapper } from "@core/dto-mapper/interface/plan.mapper.interface";
import { Plan } from "@core/entities/implementation/plans.entity";
import { IPlan } from "@core/entities/interfaces/plans.entity.interface";
import { PlanDocument } from "@core/schema/plans.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class PlanMapper implements IPlanMapper {
    toEntity(doc: PlanDocument): IPlan {
        return new Plan({
            id: (doc._id as Types.ObjectId).toString(),
            name: doc.name,
            price: doc.price,
            duration: doc.duration,
            role: doc.role,
            features: doc.features,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    toDocument(entity: Omit<IPlan, 'id'>): Partial<PlanDocument> {
        return {
            name: entity.name,
            price: entity.price,
            duration: entity.duration,
            role: entity.role,
            features: entity.features,
            isActive: entity.isActive,
        }
    }
}