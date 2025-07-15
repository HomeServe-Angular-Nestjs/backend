import { Types } from "mongoose";
import { IEntity } from "../base/interfaces/base-entity.entity.interface";
import { UserType } from "src/modules/auth/dtos/login.dto";

export type ChatRole = 'sender' | 'receiver';

export interface IChat extends IEntity {
    participants: [IParticipant, IParticipant];
    lastMessage?: string;
    lastSeenAt?: Date;
    blockedInfo?: IBlockedInfo | null;
}

export interface IParticipant {
    id: Types.ObjectId;
    type: UserType;
}


export interface IBlockedInfo {
    by: Types.ObjectId;
    at: Date;
}

export interface IUserPreview extends IParticipant {
    name: string;
    avatar: string;
}

export interface IChatData extends Omit<IChat, 'participants'> {
    receiver: IUserPreview;
    totalMessages: number;
}