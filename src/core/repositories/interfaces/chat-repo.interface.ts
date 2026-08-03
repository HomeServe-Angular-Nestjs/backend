import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { ChatDocument } from '@core/schema/chat.schema';
import { IChatParticipant } from '@core/entities/interfaces/chat.entity.interface';

export interface IChatRepository extends IBaseRepository<ChatDocument> {
    updateLastSentMessage(message: string, chatId: string): Promise<boolean>;
    findChatBetweenParticipants(first: IChatParticipant, second: IChatParticipant): Promise<ChatDocument | null>;
}