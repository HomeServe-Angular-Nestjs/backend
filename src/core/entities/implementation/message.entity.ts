import { Types } from "mongoose";
import { IMessage, MessageType } from "../interfaces/message.entity.interface";
import { BaseEntity } from "../base/implementation/base.entity";

export class Message extends BaseEntity implements IMessage {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    messageType: MessageType;
    attachments?: string[];
    isRead: boolean;
    isDeleted: boolean;

    constructor(partials: Partial<Message>) {
        super(partials);
        Object.assign(this, partials);
    }
}
