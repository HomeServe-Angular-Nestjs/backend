import { FilterQuery, Model, UpdateQuery } from 'mongoose';

import { SCHEDULES_MODEL_NAME } from '@core/constants/model.constant';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ISchedulesRepository } from '@core/repositories/interfaces/schedules-repo.interface';
import { SchedulesDocument } from '@core/schema/schedules.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SchedulesRepository extends BaseRepository<SchedulesDocument> implements ISchedulesRepository {
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


    async updateOne(filter: FilterQuery<SchedulesDocument>, update: UpdateQuery<SchedulesDocument>,): Promise<{ matchedCount: number; modifiedCount: number }> {
        const result = await this._schedulesModel.updateOne(filter, update);

        return {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        };
    }
}