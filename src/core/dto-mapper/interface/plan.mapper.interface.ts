import type { IPlan } from '@core/entities/interfaces/plans.entity.interface';
import type { PlanDocument } from '@core/schema/plans.schema';

export interface IPlanMapper {
  toEntity(doc: PlanDocument): IPlan;
  toDocument(entity: Omit<IPlan, 'id'>): Partial<PlanDocument>;
}
