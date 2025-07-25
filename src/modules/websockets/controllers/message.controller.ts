import { MESSAGE_SERVICE_NAME } from '@/core/constants/service.constant';
import { ErrorMessage } from '@/core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { GetMessagesDto } from '@modules/websockets/dto/message.dto';
import { IMessageService } from '@modules/websockets/services/interface/message-service.interface';
import { Controller, Get, Inject, InternalServerErrorException, Query } from '@nestjs/common';

@Controller('messages')
export class MessagesController {
    private readonly logger: ICustomLogger;
    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(MESSAGE_SERVICE_NAME)
        private readonly _messagesService: IMessageService
    ) {
        this.logger = this.loggerFactory.createLogger(MessagesController.name);
    }

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
