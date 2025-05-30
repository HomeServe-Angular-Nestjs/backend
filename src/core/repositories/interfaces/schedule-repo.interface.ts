import { UpdateQuery } from "mongoose";
import { ISchedule } from "../../entities/interfaces/schedule.entity.interface";
import { ScheduleDocument } from "../../schema/schedule.schema";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";

export interface IScheduleRepository extends IBaseRepository<ISchedule, ScheduleDocument> {
    findByIdAndUpdate(id: string, updateData: UpdateQuery<ScheduleDocument>): Promise<ISchedule | null>;
}