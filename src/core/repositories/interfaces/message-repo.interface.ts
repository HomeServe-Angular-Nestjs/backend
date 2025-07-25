import { FilterQuery, UpdateQuery, UpdateWriteOpResult } from 'mongoose';

import { IMessage } from '@core/entities/interfaces/message.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { MessageDocument } from '@core/schema/message.schema';

export interface IMessagesRepository extends IBaseRepository<IMessage, MessageDocument> {
    count(filter?: FilterQuery<MessageDocument>): Promise<number>;
    updateMany(filter: FilterQuery<MessageDocument>, update: UpdateQuery<MessageDocument>): Promise<UpdateWriteOpResult>;
}