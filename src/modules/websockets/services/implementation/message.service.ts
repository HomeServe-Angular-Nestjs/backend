import { Inject, Injectable, Logger } from "@nestjs/common";
import { MESSAGE_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { IMessagesRepository } from "src/core/repositories/interfaces/message-repo.interface";
import { IMessageService } from "../interface/message-service.interface";
import { MessageType, IMessage, ICreateMessage } from "src/core/entities/interfaces/message.entity.interface";
import { Types } from "mongoose";
import { IResponse } from "src/core/misc/response.util";

@Injectable()
export class MessageService implements IMessageService {
    private readonly logger = new Logger(MessageService.name);

    constructor(
        @Inject(MESSAGE_REPOSITORY_INTERFACE_NAME)
        private readonly _messageRepository: IMessagesRepository
    ) { }

    async createMessage(messageData: ICreateMessage): Promise<IMessage> {
        return await this._messageRepository.create({
            ...messageData,
            isRead: false,
            isDeleted: false
        });
    }

    async getAllMessage(chatId: string): Promise<IResponse<IMessage[]>> {
        const messages = await this._messageRepository.find(
            {
                chatId: new Types.ObjectId(chatId)
            },
            {
                sort: { createdAt: -1 },
                limit: 10,
            });

        const orderedMessages = messages.reverse();

        return {
            success: true,
            message: !!orderedMessages ? 'Messages fetched successfully.' : 'No messages found for this chat.',
            data: orderedMessages
        }
    }
}