import { CHAT_REPOSITORY_INTERFACE_NAME, MESSAGE_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import {
    ICreateMessage, IMessage, IMessagePage, IMessageService,
} from '@core/entities/interfaces/message.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { IMessagesRepository } from '@core/repositories/interfaces/message-repo.interface';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

        if (!messageDocument) {
            this.logger.error(`Failed to create message for chat ID: ${messageData.chatId}`);
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        if (!isChatUpdated) {
            this.logger.error(`Chat with ID  ${messageData.chatId} not found.`);
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        return this._messageMapper.toEntity(messageDocument);
    }

    async getAllMessage(chatId: string, currentUserId: string, beforeMessageId?: string, limit: number = 20): Promise<IResponse<IMessagePage>> {
        this._validateObjectId(chatId, 'Invalid chat id.');
        if (beforeMessageId) this._validateObjectId(beforeMessageId, 'Invalid before message id.');

        const messageDocuments = await this._messageRepository.findMessagesBefore(chatId, beforeMessageId ?? null, limit + 1);

        const hasMore = messageDocuments.length > limit;
        const pageDocuments = messageDocuments.slice(0, limit);

        const messages = pageDocuments
            .map(message => this._messageMapper.toEntity(message))
            .reverse();

        const nextCursor = messages.length > 0 ? messages[0].id : null;

        const pageIds = pageDocuments.map(message => message.id);
        if (pageIds.length > 0) {
            await this._messageRepository.updateMany(
                {
                    _id: { $in: pageIds },
                    receiverId: currentUserId,
                    isRead: false,
                },
                { $set: { isRead: true } }
            );
        }

        return {
            success: true,
            message: messages.length > 0
                ? 'Messages fetched successfully.'
                : 'No messages found for this chat.',
            data: { messages, hasMore, nextCursor }
        };
    }

    async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
        await this._messageRepository.updateMany(
            {
                chatId,
                receiverId: userId,
                isRead: false,
            },
            { $set: { isRead: true } }
        );
    }

    private _validateObjectId(value: string, message: string): void {
        if (!/^[a-f\d]{24}$/i.test(value)) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message,
            });
        }
    }
}
