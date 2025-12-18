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
}