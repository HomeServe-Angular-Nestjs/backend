import { Controller, Get, Inject, InternalServerErrorException, Logger, Query } from "@nestjs/common";
import { MESSAGE_SERVICE_NAME } from "src/core/constants/service.constant";
import { IMessageService } from "../services/interface/message-service.interface";
import { GetMessagesDto } from "../dto/message.dto";
import { ErrorMessage } from "src/core/enum/error.enum";
import { CustomLogger } from "src/core/logger/custom-logger";

@Controller('messages')
export class MessagesController {
    private readonly logger = new CustomLogger(MessagesController.name);

    constructor(
        @Inject(MESSAGE_SERVICE_NAME)
        private readonly _messagesService: IMessageService
    ) { }

    @Get('')
    async getAllMessages(@Query() dto: GetMessagesDto) {
        try {
            return this._messagesService.getAllMessage(dto.chatId, dto.beforeMessageId);
        } catch (err) {
            this.logger.error(`Error fetching messages of chat: ${dto.chatId}, ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
