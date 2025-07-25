import { ObjectId, Types } from 'mongoose';

import { MESSAGE_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { USER_SOCKET_STORE_SERVICE_NAME } from '@core/constants/service.constant';
import {
    ICreateMessage, IMessage, MessageType
} from '@core/entities/interfaces/message.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { IMessagesRepository } from '@core/repositories/interfaces/message-repo.interface';
import { IMessageService } from '@modules/websockets/services/interface/message-service.interface';
import {
    IUserSocketStoreService
} from '@modules/websockets/services/interface/user-socket-store-service.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MessageService implements IMessageService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(MESSAGE_REPOSITORY_INTERFACE_NAME)
        private readonly _messageRepository: IMessagesRepository,
        @Inject(USER_SOCKET_STORE_SERVICE_NAME)
        private readonly _userSocketService: IUserSocketStoreService
    ) {
        this.logger = this.loggerFactory.createLogger(MessageService.name);
    }

    async createMessage(messageData: ICreateMessage): Promise<IMessage> {
        return await this._messageRepository.create({
            ...messageData,
            isRead: false,
            isDeleted: false
        });
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
        const messages = await this._messageRepository.find(
            filter,
            {
                sort: { createdAt: -1 },
                limit: 10
            }
        );

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
