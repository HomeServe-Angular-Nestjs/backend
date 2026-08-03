import { Types } from 'mongoose';

import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import { IResponse } from '@core/misc/response.util';

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';


export interface IMessage extends IEntity {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    messageType: MessageType;
    attachments?: string[];
    isRead: boolean;
    isDeleted: boolean;
    clientMessageId?: string;
}

export interface ICreateMessage {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    messageType: MessageType;
    attachments?: string[];
    clientMessageId?: string;
}

export interface IMessagePage {
    messages: IMessage[];
    hasMore: boolean;
    nextCursor: string | null;
}

export interface IMessageService {
    createMessage(messageData: ICreateMessage): Promise<IMessage>;
    getAllMessage(chatId: string, currentUserId: string, beforeMessageId?: string, limit?: number): Promise<IResponse<IMessagePage>>;
    markMessagesAsRead(chatId: string, userId: string): Promise<void>;
}