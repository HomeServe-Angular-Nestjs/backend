import { FilterQuery, UpdateQuery, UpdateWriteOpResult } from 'mongoose';

import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { MessageDocument } from '@core/schema/message.schema';

export interface IMessagesRepository extends IBaseRepository<MessageDocument> {
    count(filter?: FilterQuery<MessageDocument>): Promise<number>;
    updateMany(filter: FilterQuery<MessageDocument>, update: UpdateQuery<MessageDocument>): Promise<UpdateWriteOpResult>;
}