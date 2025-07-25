import { Types } from 'mongoose';

import { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';

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
}

export interface ICreateMessage {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    messageType: MessageType;
    attachments?: string[];
}