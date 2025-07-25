import { FilterQuery, Model, UpdateQuery, UpdateWriteOpResult } from 'mongoose';

import { MESSAGE_MODEL_NAME } from '@core/constants/model.constant';
import { Message } from '@core/entities/implementation/message.entity';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IMessagesRepository } from '@core/repositories/interfaces/message-repo.interface';
import { MessageDocument } from '@core/schema/message.schema';
import { InjectModel } from '@nestjs/mongoose';

export class MessageRepository extends BaseRepository<Message, MessageDocument> implements IMessagesRepository {
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

    protected override toEntity(doc: MessageDocument): Message {
        return new Message({
            id: doc.id,
            chatId: doc.chatId,
            senderId: doc.senderId,
            receiverId: doc.receiverId,
            content: doc.content,
            attachments: doc.attachments,
            isRead: doc.isRead,
            messageType: doc.messageType,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}