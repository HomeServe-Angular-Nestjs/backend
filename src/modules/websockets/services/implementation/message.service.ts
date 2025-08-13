import { Types } from 'mongoose';

import { CHAT_REPOSITORY_INTERFACE_NAME, MESSAGE_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import {
    ICreateMessage, IMessage,
} from '@core/entities/interfaces/message.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { IMessagesRepository } from '@core/repositories/interfaces/message-repo.interface';
import { IMessageService } from '@modules/websockets/services/interface/message-service.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MESSAGE_MAPPER } from '@core/constants/mappers.constant';
import { IMessageMapper } from '@core/dto-mapper/interface/message.mapper';
import { IChatRepository } from '@core/repositories/interfaces/chat-repo.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';

@Injectable()
export class MessageService implements IMessageService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(MESSAGE_REPOSITORY_INTERFACE_NAME)
        private readonly _messageRepository: IMessagesRepository,
        @Inject(CHAT_REPOSITORY_INTERFACE_NAME)
        private readonly _chatRepository: IChatRepository,
        @Inject(MESSAGE_MAPPER)
        private readonly _messageMapper: IMessageMapper,
    ) {
        this.logger = this.loggerFactory.createLogger(MessageService.name);
    }

    async createMessage(messageData: ICreateMessage): Promise<IMessage> {
        const [messageDocument, isChatUpdated] = await Promise.all([
            this._messageRepository.create({
                ...messageData,
                isRead: false,
                isDeleted: false
            }),
            this._chatRepository.updateLastSentMessage(messageData.content, messageData.chatId.toString())
        ]);

        if (!isChatUpdated) {
            this.logger.error(`Chat with ID  ${messageData.chatId} not found.`);
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        return this._messageMapper.toEntity(messageDocument);
    }

    async getAllMessage(chatId: string, beforeMessageId?: string): Promise<IResponse<IMessage[]>> {
        const objectId = new Types.ObjectId(chatId);
        const filter: any = { chatId: objectId };

        // Apply pagination filter if beforeMessageId is passed
        if (beforeMessageId) {
            const beforeMsg = await this._messageRepository.findOne({ _id: new Types.ObjectId(beforeMessageId) });
            if (beforeMsg) {
                filter.createdAt = {
                    $lt: beforeMsg.createdAt
                }
            }
        }

        // Fetch the messages with filter applied
        const messageDocuments = await this._messageRepository.find(
            filter,
            {
                sort: { createdAt: -1 },
                limit: 10
            }
        );

        const messages = (messageDocuments ?? []).map(message => this._messageMapper.toEntity(message));

        // Identify unread messages
        const unreadMessageIds = messages
            .filter(msg => !msg.isRead)
            .map(msg => msg.id);

        // Update isRead = true in bulk
        if (unreadMessageIds.length > 0) {
            await this._messageRepository.updateMany(
                { _id: { $in: unreadMessageIds.map(id => new Types.ObjectId(id)) } },
                { $set: { isRead: true } }
            );
        }

        // Reverse for chronological order (oldest first)
        const orderedMessages = messages.reverse();

        return {
            success: true,
            message: orderedMessages.length > 0
                ? 'Messages fetched and updated successfully.'
                : 'No messages found for this chat.',
            data: orderedMessages
        };
    }
}
