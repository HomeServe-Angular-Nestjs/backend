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
import { UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';

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
        private readonly _chatMapper: IChatMapper,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadsUtility: IUploadsUtility
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

    private async _buildReceiverPreview(receiver: IParticipant): Promise<IUserPreview> {
        const receiverDetail = await this._findUserByType(receiver.type, receiver.id);

        return {
            id: receiver.id,
            type: receiver.type,
            name: receiverDetail?.fullname || receiverDetail?.username || '',
            avatar: receiverDetail?.avatar
                ? this._uploadsUtility.getSignedImageUrl(receiverDetail.avatar)
                : '',
        };
    }

    async findChat(sender: IParticipant, receiver: IParticipant): Promise<IChat | null> {
        const chatDocument = await this._chatRepository.findChatBetweenParticipants(sender, receiver);
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

                const filteredReceiverDetails = await this._buildReceiverPreview(receiver);

                const unreadMessages = await this._messageRepository.count({
                    chatId: chat.id,
                    receiverId: sender.id,
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

    async getChat(sender: IParticipant, receiver: IParticipant): Promise<IResponse<IChatData>> {
        let chatDocument = await this._chatRepository.findChatBetweenParticipants(sender, receiver);

        if (!chatDocument) {
            chatDocument = await this._chatRepository.create({
                participants: [sender, receiver],
                lastSeenAt: new Date()
            });
        }

        const chat = this._chatMapper.toEntity(chatDocument);
        const receiverPreview = await this._buildReceiverPreview(receiver);
        const unreadMessages = await this._messageRepository.count({
            chatId: chat.id,
            receiverId: sender.id,
            isRead: false,
        });

        return {
            success: true,
            message: 'Chat successfully fetched.',
            data: {
                id: chat.id,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
                lastMessage: chat.lastMessage ?? '',
                lastSeenAt: chat.lastSeenAt,
                receiver: receiverPreview,
                unreadMessages
            }
        }
    }
}

