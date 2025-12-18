import { WEEKLY_AVAILABILITY_MODEL_NAME } from "@core/constants/model.constant";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IAvailabilityRepository } from "@core/repositories/interfaces/weekly-availability-repo.interface";
import { WeeklyAvailabilityDocument } from "@core/schema/weekly-availability.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class WeeklyAvailabilityRepository extends BaseRepository<WeeklyAvailabilityDocument> implements IAvailabilityRepository {
    constructor(
        @InjectModel(WEEKLY_AVAILABILITY_MODEL_NAME)
        private readonly _weeklyAvailabilityModel: Model<WeeklyAvailabilityDocument>,
    ) {
        super(_weeklyAvailabilityModel)
    }
}
