import { FilterQuery, Model, UpdateQuery, UpdateWriteOpResult } from 'mongoose';

import { MESSAGE_MODEL_NAME } from '@core/constants/model.constant';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IMessagesRepository } from '@core/repositories/interfaces/message-repo.interface';
import { MessageDocument } from '@core/schema/message.schema';
import { InjectModel } from '@nestjs/mongoose';

export class MessageRepository extends BaseRepository<MessageDocument> implements IMessagesRepository {
    constructor(
        @InjectModel(MESSAGE_MODEL_NAME)
        private readonly _messageModel: Model<MessageDocument>,
    ) {
        super(_messageModel)
    }

    async count(filter?: FilterQuery<MessageDocument>): Promise<number> {
        return await this._messageModel.countDocuments(filter);
    }

    async updateMany(filter: FilterQuery<MessageDocument>, update: UpdateQuery<MessageDocument>): Promise<UpdateWriteOpResult> {
        return this.model.updateMany(filter, update).exec();
    }
}