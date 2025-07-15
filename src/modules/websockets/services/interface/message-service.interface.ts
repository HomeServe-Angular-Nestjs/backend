import { ICreateMessage, IMessage, MessageType } from "src/core/entities/interfaces/message.entity.interface";
import { IResponse } from "src/core/misc/response.util";

export interface IMessageService {
    createMessage(messageData: ICreateMessage): Promise<IMessage>;
    getAllMessage(chatId: string, beforeMessageId?: string): Promise<IResponse<IMessage[]>>
}