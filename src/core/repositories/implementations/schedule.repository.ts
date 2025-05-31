import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base/implementations/base.repository";
import { Schedule, Slot } from "../../entities/implementation/schedule.entity";
import { ScheduleDocument } from "../../schema/schedule.schema";
import { IScheduleRepository } from "../interfaces/schedule-repo.interface";
import { InjectModel } from "@nestjs/mongoose";
import { SCHEDULE_MODEL_NAME } from "../../constants/model.constant";
import { Model, Types, UpdateQuery } from "mongoose";
import { ISchedule, ISlot } from "../../entities/interfaces/schedule.entity.interface";

interface SlotDocType {
    _id: Types.ObjectId;
    from: string;
    to: string;
    takenBy?: string;
}
@Injectable()
export class ScheduleRepository extends BaseRepository<Schedule, ScheduleDocument> implements IScheduleRepository {

    constructor(
        @InjectModel(SCHEDULE_MODEL_NAME)
        private readonly _scheduleModel: Model<ScheduleDocument>
    ) {
        super(_scheduleModel);
    }

    async findByIdAndUpdate(id: string, updateData: UpdateQuery<ScheduleDocument>): Promise<ISchedule | null> {
        const result = await this._scheduleModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        return result ? this.toEntity(result) : null;
    }


    protected toEntity(doc: ScheduleDocument | Record<string, any>): Schedule {
        return new Schedule({
            id: (doc._id as Types.ObjectId).toString(),
            scheduleDate: doc.scheduleDate,
            slots: doc.slots.map((s: SlotDocType) => new Slot({
                id: s._id.toString(),
                from: s.from,
                to: s.to,
                takenBy: s.takenBy,
            })),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}