import { IPlan } from "@core/entities/interfaces/plans.entity.interface";
import { PlanDocument } from "@core/schema/plans.schema";

export interface IPlanMapper {
    toEntity(doc: PlanDocument): IPlan;
    toDocument(entity: Omit<IPlan, 'id'>): Partial<PlanDocument>;
}