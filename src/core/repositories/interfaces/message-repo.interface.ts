import { IMessage } from "src/core/entities/interfaces/message.entity.interface";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { MessageDocument } from "src/core/schema/message.schema";

export interface IMessagesRepository extends IBaseRepository<IMessage, MessageDocument> {

}