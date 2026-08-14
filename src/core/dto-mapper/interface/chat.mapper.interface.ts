import type { IChat } from '@core/entities/interfaces/chat.entity.interface';
import type { ChatDocument } from '@core/schema/chat.schema';

export interface IChatMapper {
  toEntity(doc: ChatDocument): IChat;
}
