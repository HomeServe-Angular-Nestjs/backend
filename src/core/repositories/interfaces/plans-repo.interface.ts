import { ICreatePlan, IPlan } from '@core/entities/interfaces/plans.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { PlanDocument } from '@core/schema/plans.schema';

export interface IPlanRepository extends IBaseRepository<PlanDocument> {
    countDocuments(): Promise<number>;
    findPlan(planId: string): Promise<PlanDocument | null>;
    updatePlan(filter: Partial<IPlan>, updateData: Partial<IPlan>, options?: { new?: boolean }): Promise<PlanDocument | null>;
    upsertPlan(filter: Partial<IPlan>, data: ICreatePlan): Promise<IPlan | null>
}