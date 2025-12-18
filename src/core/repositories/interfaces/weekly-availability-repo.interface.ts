import { IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { WeeklyAvailabilityDocument } from "@core/schema/weekly-availability.schema";

export interface IWeeklyAvailabilityRepository extends IBaseRepository<WeeklyAvailabilityDocument> {
    findOneByProviderId(providerId: string): Promise<WeeklyAvailabilityDocument>;
    updateWeekByProviderId(providerId: string, week: IWeeklyAvailability['week']): Promise<WeeklyAvailabilityDocument>;
}