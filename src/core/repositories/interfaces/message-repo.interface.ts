import { IMessage } from "src/core/entities/interfaces/message.entity.interface";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { MessageDocument } from "src/core/schema/message.schema";
import { FilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";

export interface IMessagesRepository extends IBaseRepository<IMessage, MessageDocument> {
    count(filter?: FilterQuery<MessageDocument>): Promise<number>;
    updateMany(filter: FilterQuery<MessageDocument>, update: UpdateQuery<MessageDocument>): Promise<UpdateWriteOpResult>;
}