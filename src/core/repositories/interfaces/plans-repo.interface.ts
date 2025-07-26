import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { PlanDocumentType } from '@core/schema/plans.schema';

export interface IPlanRepository extends IBaseRepository<PlanDocumentType> { }