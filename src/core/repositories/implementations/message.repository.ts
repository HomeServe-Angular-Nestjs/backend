import { Message } from "src/core/entities/implementation/message.entity";
import { BaseRepository } from "../base/implementations/base.repository";
import { MessageDocument } from "src/core/schema/message.schema";
import { IMessagesRepository } from "../interfaces/message-repo.interface";
import { InjectModel } from "@nestjs/mongoose";
import { MESSAGE_MODEL_NAME } from "src/core/constants/model.constant";
import { FilterQuery, Model, UpdateQuery, UpdateWriteOpResult } from "mongoose";

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