import type { ICreateMessage, IMessage } from '@core/entities/interfaces/message.entity.interface';
import { MessageType } from '@core/entities/interfaces/message.entity.interface';
import type { IResponse } from '@core/misc/response.util';

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
