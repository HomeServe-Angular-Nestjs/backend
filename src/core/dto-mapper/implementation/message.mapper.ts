import { IMessageMapper } from "@core/dto-mapper/interface/message.mapper";
import { Message } from "@core/entities/implementation/message.entity";
import { IMessage } from "@core/entities/interfaces/message.entity.interface";
import { MessageDocument } from "@core/schema/message.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MessageMapper implements IMessageMapper {
    toEntity(doc: MessageDocument): IMessage {
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