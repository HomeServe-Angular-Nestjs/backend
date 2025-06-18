import { ScheduleDay, Schedules, Slot } from "src/core/entities/implementation/schedules.entity";
import { BaseRepository } from "../base/implementations/base.repository";
import { SchedulesDocument } from "src/core/schema/schedules.schema";
import { FilterQuery, Model, Types, UpdateQuery } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { SCHEDULES_MODEL_NAME } from "src/core/constants/model.constant";
import { ISchedulesRepository } from "../interfaces/schedules-repo.interface";

export class SchedulesRepository extends BaseRepository<Schedules, SchedulesDocument> implements ISchedulesRepository {
    constructor(
        @InjectModel(SCHEDULES_MODEL_NAME)
        private readonly _schedulesModel: Model<SchedulesDocument>,
    ) {
        super(_schedulesModel);
    }

    async isExists(filter: FilterQuery<SchedulesDocument>): Promise<boolean> {
        const result = await this._schedulesModel.exists(filter);
        return result !== null;
    }


    async count(filter?: FilterQuery<SchedulesDocument>): Promise<number> {
        return await this._schedulesModel.countDocuments(filter);
    }


    async updateOne(
        filter: FilterQuery<SchedulesDocument>,
        update: UpdateQuery<SchedulesDocument>,
    ): Promise<{ matchedCount: number; modifiedCount: number }> {
        const result = await this._schedulesModel.updateOne(filter, update);

        return {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        };
    }

    protected toEntity(doc: SchedulesDocument | Record<string, any>): Schedules {
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