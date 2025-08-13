import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { ChatDocument } from '@core/schema/chat.schema';

export interface IChatRepository extends IBaseRepository<ChatDocument> {
    updateLastSentMessage(message: string, chatId: string): Promise<boolean>;
}