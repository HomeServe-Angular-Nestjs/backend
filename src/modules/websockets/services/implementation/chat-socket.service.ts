import { Types } from 'mongoose';

import {
    ADMIN_REPOSITORY_NAME, CHAT_REPOSITORY_INTERFACE_NAME,
    CUSTOMER_REPOSITORY_INTERFACE_NAME, MESSAGE_REPOSITORY_INTERFACE_NAME,
    PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@core/constants/repository.constant';
import {
    IChat, IChatData, IParticipant, IUserPreview
} from '@core/entities/interfaces/chat.entity.interface';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import { IAdminRepository } from '@core/repositories/interfaces/admin-repo.interface';
import { IChatRepository } from '@core/repositories/interfaces/chat-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IMessagesRepository } from '@core/repositories/interfaces/message-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import {
    IChatSocketService
} from '@modules/websockets/services/interface/chat-socket-service.interface';
import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { CHAT_MAPPER } from '@core/constants/mappers.constant';
import { IChatMapper } from '@core/dto-mapper/interface/chat.mapper.interface';
import { UserType } from '@core/entities/interfaces/user.entity.interface';

@Injectable()
export class ChatSocketService implements IChatSocketService {
    private readonly logger = new CustomLogger(ChatSocketService.name);

    constructor(
        @Inject(CHAT_REPOSITORY_INTERFACE_NAME)
        private readonly _chatRepository: IChatRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(ADMIN_REPOSITORY_NAME)
        private readonly _adminRepository: IAdminRepository, //!Todo remove 
        @Inject(MESSAGE_REPOSITORY_INTERFACE_NAME)
        private readonly _messageRepository: IMessagesRepository,
        @Inject(CHAT_MAPPER)
        private readonly _chatMapper: IChatMapper
    ) { }

    private async _findUserByType(type: Omit<UserType, 'admin'>, id: Types.ObjectId) {
        switch (type) {
            case 'customer':
                return await this._customerRepository.findById(id);
            case 'provider':
                return await this._providerRepository.findById(id);
            default:
                throw new BadGatewayException('Invalid user type');
        }
    }

    private _buildChatQuery(sender: IParticipant, receiver: IParticipant) {
        return {
            $and: [
                { participants: { $elemMatch: { id: sender.id, type: sender.type } } },
                { participants: { $elemMatch: { id: receiver.id, type: receiver.type } } }
            ],
            $expr: { $eq: [{ $size: '$participants' }, 2] }
        };
    }

    async findChat(sender: IParticipant, receiver: IParticipant): Promise<IChat | null> {
        const query = this._buildChatQuery(sender, receiver);
        const chatDocument = await this._chatRepository.findOne(query);
        if (!chatDocument) return null;
        return this._chatMapper.toEntity(chatDocument);
    }

    async createChat(sender: IParticipant, receiver: IParticipant): Promise<IChat> {
        const newChatDocument = await this._chatRepository.create({
            participants: [sender, receiver],
            lastSeenAt: new Date()
        });

        return this._chatMapper.toEntity(newChatDocument);
    }

    async getAllChat(sender: IParticipant): Promise<IResponse<IChatData[]>> {
        const chats = await this._chatRepository.find({
            participants: {
                $elemMatch: { id: sender.id, type: sender.type }
            },
            $expr: { $eq: [{ $size: '$participants' }, 2], }
        });

        const result: IChatData[] = await Promise.all(
            chats.map(async (chat): Promise<IChatData> => {
                const receiver = chat.participants.find(
                    (p) => p.id.toString() !== sender.id.toString()
                );

                if (!receiver) {
                    this.logger.error('Could not find the receiver.');
                    throw new Error('Corrupted DB document: missing receiver');
                }

                const receiverDetail = await this._findUserByType(receiver.type, receiver.id);

                const filteredReceiverDetails: IUserPreview = {
                    id: receiver.id,
                    type: receiver.type,
                    name: receiverDetail?.fullname || receiverDetail?.username || '',
                    avatar: receiverDetail?.avatar || '',
                };

                const unreadMessages = await this._messageRepository.count({
                    chatId: chat.id,
                    senderId: sender.id,
                    isRead: false,
                });

                return {
                    id: chat.id.toString(),
                    createdAt: chat.createdAt,
                    lastMessage: chat.lastMessage ?? '',
                    receiver: filteredReceiverDetails,
                    lastSeenAt: chat.lastSeenAt,
                    unreadMessages: unreadMessages
                };
            })
        );

        return {
            message: 'fetched successfully',
            success: true,
            data: result
        }
    }

    async getChat(sender: IParticipant, receiver: IParticipant): Promise<IResponse<IChat>> {
        const query = this._buildChatQuery(sender, receiver);

        const existingChat = await this._chatRepository.findOne(query);

        if (!existingChat) {
            const newChat = await this.createChat(sender, receiver);
            return {
                success: !!newChat,
                message: 'Chat successfully created.',
                data: newChat
            }
        }

        const updatedChat = await this._chatRepository.findOneAndUpdate(
            query,
            { $set: { lastSeenAt: new Date() } },
            { new: true }
        );

        if (!updatedChat) {
            this.logger.error('Chat not updated with lastSeenAt.');
            throw new Error('Error updating chat.');
        }

        return {
            success: true,
            message: 'Chat successfully fetched.',
            data: this._chatMapper.toEntity(updatedChat)
        }
    }
}

