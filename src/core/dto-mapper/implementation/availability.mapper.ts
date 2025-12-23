import { IAvailabilityMapper } from "@core/dto-mapper/interface/availability.mapper.interface";
import { DateOverride } from "@core/entities/implementation/date-override.entity";
import { WeeklyAvailability } from "@core/entities/implementation/weekly-availability.entity";
import { IDateOverride } from "@core/entities/interfaces/date-override.entity.interface";
import { IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";
import { DateOverrideDocument } from "@core/schema/date-overrides.schema";
import { WeeklyAvailabilityDocument } from "@core/schema/weekly-availability.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class AvailabilityMapper implements IAvailabilityMapper {

    toWeeklyAvailabilityEntity(doc: WeeklyAvailabilityDocument): IWeeklyAvailability {
        return new WeeklyAvailability({
            id: (doc._id as Types.ObjectId).toString(),
            providerId: (doc.providerId as Types.ObjectId).toString(),
            week: {
                sun: {
                    isAvailable: doc.week.sun.isAvailable,
                    timeRanges: doc.week.sun.timeRanges
                },
                mon: {
                    isAvailable: doc.week.mon.isAvailable,
                    timeRanges: doc.week.mon.timeRanges
                },
                tue: {
                    isAvailable: doc.week.tue.isAvailable,
                    timeRanges: doc.week.tue.timeRanges
                },
                wed: {
                    isAvailable: doc.week.wed.isAvailable,
                    timeRanges: doc.week.wed.timeRanges
                },
                thu: {
                    isAvailable: doc.week.thu.isAvailable,
                    timeRanges: doc.week.thu.timeRanges
                },
                fri: {
                    isAvailable: doc.week.fri.isAvailable,
                    timeRanges: doc.week.fri.timeRanges
                },
                sat: {
                    isAvailable: doc.week.sat.isAvailable,
                    timeRanges: doc.week.sat.timeRanges
                },
            }
        });
    }

    toWeeklyAvailabilityDocument(entity: IWeeklyAvailability): Partial<WeeklyAvailabilityDocument> {
        return {
            providerId: new Types.ObjectId(entity.providerId),
            week: {
                sun: {
                    isAvailable: entity.week.sun.isAvailable,
                    timeRanges: entity.week.sun.timeRanges
                },
                mon: {
                    isAvailable: entity.week.mon.isAvailable,
                    timeRanges: entity.week.mon.timeRanges
                },
                tue: {
                    isAvailable: entity.week.tue.isAvailable,
                    timeRanges: entity.week.tue.timeRanges
                },
                wed: {
                    isAvailable: entity.week.wed.isAvailable,
                    timeRanges: entity.week.wed.timeRanges
                },
                thu: {
                    isAvailable: entity.week.thu.isAvailable,
                    timeRanges: entity.week.thu.timeRanges
                },
                fri: {
                    isAvailable: entity.week.fri.isAvailable,
                    timeRanges: entity.week.fri.timeRanges
                },
                sat: {
                    isAvailable: entity.week.sat.isAvailable,
                    timeRanges: entity.week.sat.timeRanges
                },
            }
        };
    }

    toDateOverrideDocument(entity: Omit<IDateOverride, 'id'>): Partial<DateOverrideDocument> {
        const date = new Date(entity.date);
        date.setHours(0, 0, 0, 0);

        return {
            providerId: new Types.ObjectId(entity.providerId),
            date,
            reason: entity.reason ?? '',
            timeRanges: entity.timeRanges,
            isAvailable: entity.isAvailable,
        }
    }

    toDateOverrideEntity(doc: DateOverrideDocument): IDateOverride {
        return new DateOverride({
            id: (doc._id as Types.ObjectId).toString(),
            providerId: (doc.providerId as Types.ObjectId).toString(),
            date: doc.date,
            reason: doc.reason,
            timeRanges: (doc.timeRanges ?? []).map(range => ({
                startTime: range.startTime,
                endTime: range.endTime,
            })),
            isAvailable: doc.isAvailable,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

}