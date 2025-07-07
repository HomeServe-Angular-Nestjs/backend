import { IChat, IChatData, IParticipant } from "src/core/entities/interfaces/chat.entity.interface";
import { IResponse } from "src/core/misc/response.util";

export interface IChatSocketService {
    findChat(sender: IParticipant, receiver: IParticipant): Promise<IChat | null>;
    createChat(sender: IParticipant, receiver: IParticipant): Promise<IChat>;
    getAllChat(sender: IParticipant): Promise<IResponse<IChatData[]>>;
    getChat(sender: IParticipant, receiver: IParticipant): Promise<IResponse<IChat>>;
}