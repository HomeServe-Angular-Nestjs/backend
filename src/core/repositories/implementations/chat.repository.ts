import { Model } from 'mongoose';

import { CHAT_MODEL_NAME } from '@core/constants/model.constant';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IChatRepository } from '@core/repositories/interfaces/chat-repo.interface';
import { ChatDocument } from '@core/schema/chat.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ChatRepository extends BaseRepository<ChatDocument> implements IChatRepository {
    constructor(
        @InjectModel(CHAT_MODEL_NAME)
        private readonly _chatModel: Model<ChatDocument>
    ) {
        super(_chatModel)
    }
}