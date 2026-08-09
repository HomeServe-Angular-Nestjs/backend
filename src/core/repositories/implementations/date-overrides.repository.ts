import { DATE_OVERRIDE_MODEL_NAME } from "@core/constants/model.constant";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IDateOverridesRepository } from "@core/repositories/interfaces/date-overrides.repo.interface";
import { DateOverrideDocument } from "@core/schema/date-overrides.schema";
import { toUtcMidnight } from "@core/utilities/date.utility";
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
        const targetDate = toUtcMidnight(date);

        const result = await this._dateOverrideModel.deleteOne(
            {
                providerId: this._toObjectId(providerId),
                date: targetDate,
            });

            console.log(result)

        return result.deletedCount === 1;
    }

    async isValidOverrideDate(providerId: string, date: Date): Promise<boolean> {
        const targetDate = toUtcMidnight(date);
        const today = toUtcMidnight(new Date());

        if (targetDate <= today) {
            return false;
        }

        const overrides = await this.fetchOverridesByProviderId(providerId);

        return overrides.some(override =>
            toUtcMidnight(override.date).getTime() === targetDate.getTime()
        );
    }
}