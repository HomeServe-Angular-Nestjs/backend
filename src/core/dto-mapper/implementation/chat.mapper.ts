import { IChatMapper } from "@core/dto-mapper/interface/chat.mapper.interface";
import { Chat } from "@core/entities/implementation/chat.entity";
import { IChat } from "@core/entities/interfaces/chat.entity.interface";
import { ChatDocument } from "@core/schema/chat.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ChatMapper implements IChatMapper {
    toEntity(doc: ChatDocument): IChat {
        return new Chat({
            id: (doc._id as Types.ObjectId).toString(),
            participants: doc.participants,
            blockedInfo: doc.blockedInfo,
            createdAt: doc.createdAt,
            lastSeenAt: doc.lastSeenAt,
            updatedAt: doc.updatedAt,
            lastMessage: doc.lastMessage
        });
    }
}