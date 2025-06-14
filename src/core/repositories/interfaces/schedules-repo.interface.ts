import { ISchedules } from "src/core/entities/interfaces/schedules.entity.interface";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { SchedulesDocumnet } from "src/core/schema/schedules.schema";
import { FilterQuery } from "mongoose";

export interface ISchedulesRepository extends IBaseRepository<ISchedules, SchedulesDocumnet> {
    isExists(filter: FilterQuery<SchedulesDocumnet>): Promise<boolean>;
    count(filter?: FilterQuery<SchedulesDocumnet>): Promise<number>;

}