import type { Types } from 'mongoose';

import { BaseEntity } from '../base/implementation/base.entity';
import type { IMessage, MessageType } from '../interfaces/message.entity.interface';

export class Message extends BaseEntity implements IMessage {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  messageType: MessageType;
  attachments?: string[];
  isRead: boolean;
  isDeleted: boolean;
  clientMessageId?: string;

  constructor(partials: Partial<Message>) {
    super(partials);
    Object.assign(this, partials);
  }
}
