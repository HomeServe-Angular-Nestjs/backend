import { IMessage } from "@core/entities/interfaces/message.entity.interface";
import { MessageDocument } from "@core/schema/message.schema";

export interface IMessageMapper {
    toEntity(doc: MessageDocument): IMessage;
}