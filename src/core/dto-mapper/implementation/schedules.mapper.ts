import { ISchedulesMapper } from "@core/dto-mapper/interface/schedules.mapper,interface";
import { ScheduleDay, Schedules, Slot } from "@core/entities/implementation/schedules.entity";
import { ISchedules } from "@core/entities/interfaces/schedules.entity.interface";
import { SchedulesDocument } from "@core/schema/schedules.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class SchedulesMapper implements ISchedulesMapper {
    toEntity(doc: SchedulesDocument): ISchedules {
        return new Schedules({
            id: (doc._id as Types.ObjectId).toString(),
            providerId: doc.providerId,
            month: doc.month,
            days: doc.days.map(day =>
                new ScheduleDay({
                    id: day.id,
                    date: day.date,
                    slots: day.slots.map(slot =>
                        new Slot({
                            id: slot.id,
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