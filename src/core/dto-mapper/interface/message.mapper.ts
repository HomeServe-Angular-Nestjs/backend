import type { IMessage } from '@core/entities/interfaces/message.entity.interface';
import type { MessageDocument } from '@core/schema/message.schema';

export interface IMessageMapper {
  toEntity(doc: MessageDocument): IMessage;
}
