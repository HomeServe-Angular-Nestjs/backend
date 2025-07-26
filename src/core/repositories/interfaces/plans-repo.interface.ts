import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { PlanDocument } from '@core/schema/plans.schema';

export interface IPlanRepository extends IBaseRepository<PlanDocument> { }