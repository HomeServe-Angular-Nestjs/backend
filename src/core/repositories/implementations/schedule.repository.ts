import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base/implementations/base.repository";
import { Schedule } from "../../entities/implementation/schedule.entity";
import { ScheduleDocument } from "../../schema/schedule.schema";
import { IScheduleRepository } from "../interfaces/schedule-repo.interface";
import { InjectModel } from "@nestjs/mongoose";
import { SCHEDULE_MODEL_NAME } from "../../constants/model.constant";
import { Model, Types } from "mongoose";

@Injectable()
export class ScheduleRepository extends BaseRepository<Schedule, ScheduleDocument> implements IScheduleRepository {

    constructor(@InjectModel(SCHEDULE_MODEL_NAME) scheduleModel: Model<ScheduleDocument>) {
        super(scheduleModel);
    }

    protected toEntity(doc: ScheduleDocument | Record<string, any>): Schedule {
        console.log(doc)
        return new Schedule({
            id: (doc._id as Types.ObjectId).toString(),
            scheduleDate: doc.scheduleDate,
            slots: doc.slots
        });
    }
}