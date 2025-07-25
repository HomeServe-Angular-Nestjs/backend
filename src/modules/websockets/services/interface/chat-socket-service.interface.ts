import { IChat, IChatData, IParticipant } from '@/core/entities/interfaces/chat.entity.interface';
import { IResponse } from '@/core/misc/response.util';

export interface IChatSocketService {
    findChat(sender: IParticipant, receiver: IParticipant): Promise<IChat | null>;
    createChat(sender: IParticipant, receiver: IParticipant): Promise<IChat>;
    getAllChat(sender: IParticipant): Promise<IResponse<IChatData[]>>;
    getChat(sender: IParticipant, receiver: IParticipant): Promise<IResponse<IChat>>;
}