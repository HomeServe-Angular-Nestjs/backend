import { IDateOverride } from "@core/entities/interfaces/date-override.entity.interface";
import { IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";
import { DateOverrideDocument } from "@core/schema/date-overrides.schema";
import { WeeklyAvailabilityDocument } from "@core/schema/weekly-availability.schema";

export interface IAvailabilityMapper {
    toWeeklyAvailabilityEntity(doc: WeeklyAvailabilityDocument): IWeeklyAvailability;
    toWeeklyAvailabilityDocument(entity: IWeeklyAvailability): Partial<WeeklyAvailabilityDocument>;
    toDateOverrideEntity(doc: DateOverrideDocument): IDateOverride;
    toDateOverrideDocument(entity: IDateOverride): Partial<DateOverrideDocument>;
}