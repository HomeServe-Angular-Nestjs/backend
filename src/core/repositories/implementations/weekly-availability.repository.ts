import { WEEKLY_AVAILABILITY_MODEL_NAME } from "@core/constants/model.constant";
import { IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IWeeklyAvailabilityRepository } from "@core/repositories/interfaces/weekly-availability-repo.interface";
import { WeeklyAvailabilityDocument } from "@core/schema/weekly-availability.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class WeeklyAvailabilityRepository extends BaseRepository<WeeklyAvailabilityDocument> implements IWeeklyAvailabilityRepository {
    constructor(
        @InjectModel(WEEKLY_AVAILABILITY_MODEL_NAME)
        private readonly _weeklyAvailabilityModel: Model<WeeklyAvailabilityDocument>,
    ) {
        super(_weeklyAvailabilityModel)
    }

    private _defaultDayAvailability() {
        return {
            isAvailable: false,
            timeRanges: [],
        };
    }

    async findOneByProviderId(providerId: string): Promise<WeeklyAvailabilityDocument> {
        return await this._weeklyAvailabilityModel.findOneAndUpdate(
            { providerId: this._toObjectId(providerId) },
            {
                $setOnInsert: {
                    providerId: this._toObjectId(providerId),
                    week: {
                        sun: this._defaultDayAvailability(),
                        mon: this._defaultDayAvailability(),
                        tue: this._defaultDayAvailability(),
                        wed: this._defaultDayAvailability(),
                        thu: this._defaultDayAvailability(),
                        fri: this._defaultDayAvailability(),
                        sat: this._defaultDayAvailability(),
                    },
                },
            },
            {
                new: true,
                upsert: true,
            }
        );
    }

    async updateWeekByProviderId(providerId: string, week: IWeeklyAvailability['week']): Promise<WeeklyAvailabilityDocument> {
        return this._weeklyAvailabilityModel.findOneAndUpdate(
            { providerId: this._toObjectId(providerId) },
            {
                $set: { week },
                $setOnInsert: { providerId: this._toObjectId(providerId) },
            },
            {
                new: true,
                upsert: true,
            }
        );
    }
}
