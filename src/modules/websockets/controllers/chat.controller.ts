import { Request } from 'express';
import { Types } from 'mongoose';

import { CHAT_SOCKET_SERVICE_NAME } from '@/core/constants/service.constant';
import { IChatData, IParticipant } from '@/core/entities/interfaces/chat.entity.interface';
import { ErrorMessage } from '@/core/enum/error.enum';
import { IPayload } from '@/core/misc/payload.interface';
import { IResponse } from '@/core/misc/response.util';
import { UserType } from '@/modules/auth/dtos/login.dto';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { GetChatDto } from '@modules/websockets/dto/chat.dto';
import {
    IChatSocketService
} from '@modules/websockets/services/interface/chat-socket-service.interface';
import {
    Controller, Get, Inject, InternalServerErrorException, Query, Req, UnauthorizedException
} from '@nestjs/common';

@Controller('chat')
export class ChatController {
    private logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(CHAT_SOCKET_SERVICE_NAME)
        private readonly _chatService: IChatSocketService
    ) {
        this.logger = this.loggerFactory.createLogger(ChatController.name);
    }

    @Get('all')
    async getAllChats(@Req() req: Request): Promise<IResponse<IChatData[]>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub || !user.type) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            const sender: IParticipant = {
                id: new Types.ObjectId(user.sub),
                type: user.type,
            };

            return await this._chatService.getAllChat(sender);
        } catch (err) {
            this.logger.error('Error fetching chats: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('one')
    async getChat(@Req() req: Request, @Query() dto: GetChatDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub || !user.type) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            const sender: IParticipant = {
                id: new Types.ObjectId(user.sub),
                type: user.type,
            }

            const receiver: IParticipant = {
                id: new Types.ObjectId(dto.id),
                type: dto.type as UserType,
            }

            return await this._chatService.getChat(sender, receiver);
        } catch (err) {
            this.logger.error('Error fetching chats: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
