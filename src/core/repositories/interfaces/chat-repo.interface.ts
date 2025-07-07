import { IChat } from "src/core/entities/interfaces/chat.entity.interface";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { ChatDocument } from "src/core/schema/chat.schema";

export interface IChatRepository extends IBaseRepository<IChat, ChatDocument> {

}