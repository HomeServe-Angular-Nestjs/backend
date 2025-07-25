import {
    ICreateMessage, IMessage, MessageType
} from '@core/entities/interfaces/message.entity.interface';
import { IResponse } from '@core/misc/response.util';

export interface IMessageService {
    createMessage(messageData: ICreateMessage): Promise<IMessage>;
    getAllMessage(chatId: string, beforeMessageId?: string): Promise<IResponse<IMessage[]>>
}