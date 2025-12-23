import { DATE_OVERRIDE_MODEL_NAME } from "@core/constants/model.constant";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IDateOverridesRepository } from "@core/repositories/interfaces/date-overrides.repo.interface";
import { DateOverrideDocument } from "@core/schema/date-overrides.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class DateOverridesRepository extends BaseRepository<DateOverrideDocument> implements IDateOverridesRepository {
    constructor(
        @InjectModel(DATE_OVERRIDE_MODEL_NAME)
        private readonly _dateOverrideModel: Model<DateOverrideDocument>,
    ) {
        super(_dateOverrideModel)
    }

    async fetchOverridesByProviderId(providerId: string): Promise<DateOverrideDocument[]> {
        return await this._dateOverrideModel.find({ providerId: this._toObjectId(providerId) }).lean();
    }

    async createOverride(providerId: string, overrideDoc: Partial<DateOverrideDocument>): Promise<DateOverrideDocument> {
        return await this._dateOverrideModel.create({
            providerId: this._toObjectId(providerId),
            ...overrideDoc,
        });
    }

    async deleteOneByProviderIdAndDate(providerId: string, date: Date): Promise<boolean> {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const result = await this._dateOverrideModel.deleteOne(
            {
                providerId: this._toObjectId(providerId),
                date: targetDate,
            });

        return result.deletedCount === 1;
    }

    async isValidOverrideDate(providerId: string, date: Date): Promise<boolean> {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (targetDate <= today) {
            return false;
        }

        const exists = await this._dateOverrideModel.exists({
            providerId: this._toObjectId(providerId),
            date: {
                $gte: targetDate,
                $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        return !!exists;
    }
}