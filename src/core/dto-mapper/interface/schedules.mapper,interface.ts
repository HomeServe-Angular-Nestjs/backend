import { ISchedules } from "@core/entities/interfaces/schedules.entity.interface";
import { SchedulesDocument } from "@core/schema/schedules.schema";

export interface ISchedulesMapper {
    toEntity(doc: SchedulesDocument): ISchedules;
}