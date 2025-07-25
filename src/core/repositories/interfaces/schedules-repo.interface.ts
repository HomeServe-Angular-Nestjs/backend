import { FilterQuery, UpdateQuery } from 'mongoose';

import { ISchedules } from '@core/entities/interfaces/schedules.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { SchedulesDocument } from '@core/schema/schedules.schema';

export interface ISchedulesRepository extends IBaseRepository<ISchedules, SchedulesDocument> {
    isExists(filter: FilterQuery<SchedulesDocument>): Promise<boolean>;
    count(filter?: FilterQuery<SchedulesDocument>): Promise<number>;
    updateOne(
        filter: FilterQuery<SchedulesDocument>,
        update: UpdateQuery<SchedulesDocument>
    ): Promise<{ matchedCount: number; modifiedCount: number }>;
}