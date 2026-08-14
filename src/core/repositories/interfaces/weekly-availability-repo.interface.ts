import type { IWeeklyAvailability } from '@core/entities/interfaces/weekly-availability.entity.interface';
import type { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import type { WeeklyAvailabilityDocument } from '@core/schema/weekly-availability.schema';

export interface IWeeklyAvailabilityRepository extends IBaseRepository<WeeklyAvailabilityDocument> {
  findOneByProviderId(providerId: string): Promise<WeeklyAvailabilityDocument>;
  updateWeekByProviderId(providerId: string, week: IWeeklyAvailability['week']): Promise<WeeklyAvailabilityDocument>;
  findByProviderId(providerId: string): Promise<WeeklyAvailabilityDocument[]>;
}
