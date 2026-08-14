import type { IDateOverride } from '@core/entities/interfaces/date-override.entity.interface';
import type { IWeeklyAvailability } from '@core/entities/interfaces/weekly-availability.entity.interface';
import type { DateOverrideDocument } from '@core/schema/date-overrides.schema';
import type { WeeklyAvailabilityDocument } from '@core/schema/weekly-availability.schema';

export interface IAvailabilityMapper {
  toWeeklyAvailabilityEntity(doc: WeeklyAvailabilityDocument): IWeeklyAvailability;
  toWeeklyAvailabilityDocument(entity: IWeeklyAvailability): Partial<WeeklyAvailabilityDocument>;
  toDateOverrideEntity(doc: DateOverrideDocument): IDateOverride;
  toDateOverrideDocument(entity: Omit<IDateOverride, 'id'>): Partial<DateOverrideDocument>;
}
