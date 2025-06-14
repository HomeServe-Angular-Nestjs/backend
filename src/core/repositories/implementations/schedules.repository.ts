import { ScheduleDay, Schedules, Slot } from "src/core/entities/implementation/schedules.entity";
import { BaseRepository } from "../base/implementations/base.repository";
import { SchedulesDocumnet } from "src/core/schema/schedules.schema";
import { FilterQuery, Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { SCHEDULES_MODEL_NAME } from "src/core/constants/model.constant";
import { IScheduleDay, ISlot } from "src/core/entities/interfaces/schedules.entity.interface";
import { ISchedulesRepository } from "../interfaces/schedules-repo.interface";

export class SchedulesRepository extends BaseRepository<Schedules, SchedulesDocumnet> implements ISchedulesRepository {
    constructor(
        @InjectModel(SCHEDULES_MODEL_NAME)
        private readonly _schedulesModel: Model<SchedulesDocumnet>,
    ) {
        super(_schedulesModel);
    }

    async isExists(filter: FilterQuery<SchedulesDocumnet>): Promise<boolean> {
        const result = await this._schedulesModel.exists(filter);
        return result !== null;
    }


    async count(filter?: FilterQuery<SchedulesDocumnet>): Promise<number> {
        return await this._schedulesModel.countDocuments(filter);
    }

    protected toEntity(doc: SchedulesDocumnet | Record<string, any>): Schedules {
        return new Schedules({
            id: (doc._id as Types.ObjectId).toString(),
            providerId: doc.providerId,
            month: doc.month,
            days: doc.days.map(day =>
                new ScheduleDay({
                    id: (day._id as Types.ObjectId).toString(),
                    date: day.date,
                    slots: day.slots.map(slot =>
                        new Slot({
                            id: (slot._id as Types.ObjectId).toString(),
                            from: slot.from,
                            to: slot.to,
                            takenBy: slot.takenBy,
                            isActive: doc.isActive,
                        })),
                    isActive: day.isActive,
                })),
            isActive: doc.isActive,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}