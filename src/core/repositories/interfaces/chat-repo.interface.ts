import { IChat } from '@core/entities/interfaces/chat.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { ChatDocument } from '@core/schema/chat.schema';

export interface IChatRepository extends IBaseRepository<IChat, ChatDocument> {

}