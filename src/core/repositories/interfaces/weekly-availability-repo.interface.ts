import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { WeeklyAvailabilityDocument } from "@core/schema/weekly-availability.schema";

export interface IAvailabilityRepository extends IBaseRepository<WeeklyAvailabilityDocument> {

}