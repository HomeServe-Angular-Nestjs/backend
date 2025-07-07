import { Inject, Injectable, Logger, Type } from "@nestjs/common";
import { IChatSocketService } from "../interface/chat-socket-service.interface";
import { ADMIN_REPOSITORY_INTERFACE_NAME, CHAT_REPOSITORY_INTERFACE_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, MESSAGE_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { IChatRepository } from "src/core/repositories/interfaces/chat-repo.interface";
import { IChat, IChatData, IParticipant, IUserPreview } from "src/core/entities/interfaces/chat.entity.interface";
import { Types } from "mongoose";
import { IResponse } from "src/core/misc/response.util";
import { ICustomerRepository } from "src/core/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "src/core/repositories/interfaces/provider-repo.interface";
import { IAdminRepository } from "src/core/repositories/interfaces/admin-repo.interface";
import { UserType } from "src/modules/auth/dtos/login.dto";

@Injectable()
export class ChatSocketService implements IChatSocketService {
    private readonly logger = new Logger(ChatSocketService.name);

    constructor(
        @Inject(CHAT_REPOSITORY_INTERFACE_NAME)
        private readonly _chatRepository: IChatRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(ADMIN_REPOSITORY_INTERFACE_NAME)
        private readonly _adminRepository: IAdminRepository
    ) { }

    private async _findUserByType(type: UserType, id: Types.ObjectId) {
        switch (type) {
            case 'customer':
                return await this._customerRepository.findById(id);
            case 'provider':
                return await this._providerRepository.findById(id);
            case 'admin':
                return await this._adminRepository.findById(id);
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
        return this._chatRepository.findOne(query);
    }

    async createChat(sender: IParticipant, receiver: IParticipant): Promise<IChat> {
        return await this._chatRepository.create({
            participants: [sender, receiver],
            lastSeenAt: new Date()
        });
    }

    async getAllChat(sender: IParticipant): Promise<IResponse<IChatData[]>> {
        const chats = await this._chatRepository.find({
            participants: {
                $elemMatch: { id: sender.id, type: sender.type }
            },
            $expr: { $eq: [{ $size: '$participants' }, 2], }
        });
 
        this.logger.debug('chats');

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
                }

                return {
                    id: chat.id.toString(),
                    createdAt: chat.createdAt,
                    lastMessage: chat.lastMessage ?? '',
                    receiver: filteredReceiverDetails,
                    lastSeenAt: chat.lastSeenAt
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
            data: updatedChat
        }
    }
}

