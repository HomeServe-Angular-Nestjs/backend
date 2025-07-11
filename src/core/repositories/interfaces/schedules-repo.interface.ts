import { ISchedules } from "src/core/entities/interfaces/schedules.entity.interface";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { SchedulesDocument } from "src/core/schema/schedules.schema";
import { FilterQuery, UpdateQuery } from "mongoose";

export interface ISchedulesRepository extends IBaseRepository<ISchedules, SchedulesDocument> {
    isExists(filter: FilterQuery<SchedulesDocument>): Promise<boolean>;
    count(filter?: FilterQuery<SchedulesDocument>): Promise<number>;
    updateOne(
        filter: FilterQuery<SchedulesDocument>,
        update: UpdateQuery<SchedulesDocument>
    ): Promise<{ matchedCount: number; modifiedCount: number }>;
}