import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base/implementations/base.repository";
import { ChatDocument } from "src/core/schema/chat.schema";
import { Chat } from "src/core/entities/implementation/chat.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CHAT_MODEL_NAME } from "src/core/constants/model.constant";
import { IChatRepository } from "../interfaces/chat-repo.interface";

@Injectable()
export class ChatRepository extends BaseRepository<Chat, ChatDocument> implements IChatRepository {
    constructor(
        @InjectModel(CHAT_MODEL_NAME)
        private readonly _chatModel: Model<ChatDocument>
    ) {
        super(_chatModel)
    }

    protected override toEntity(doc: ChatDocument): Chat {
        return new Chat({
            id: doc.id,
            participants: doc.participants,
            blockedInfo: doc.blockedInfo,
            createdAt: doc.createdAt,
            lastSeenAt: doc.lastSeenAt,
            updatedAt: doc.updatedAt,
            lastMessage: doc.lastMessage
        });
    }
}