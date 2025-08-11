import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { CHAT_SOCKET_SERVICE_NAME, TOKEN_SERVICE_NAME } from '@/core/constants/service.constant';
import { IChatData, IParticipant } from '@/core/entities/interfaces/chat.entity.interface';
import { ErrorCodes, ErrorMessage } from '@/core/enum/error.enum';
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
    Controller, Get, Inject, InternalServerErrorException, Post, Query, Req, Res, UnauthorizedException
} from '@nestjs/common';
import { ITokenService } from '@modules/auth/services/interfaces/token-service.interface';

@Controller('chat')
export class ChatController {
    private logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(CHAT_SOCKET_SERVICE_NAME)
        private readonly _chatService: IChatSocketService,
        @Inject(TOKEN_SERVICE_NAME)
        private readonly _tokenService: ITokenService,
    ) {
        this.logger = this.loggerFactory.createLogger(ChatController.name);
    }

    @Post('new_access_token')
    async newAccessToken(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies['refresh_token'];;
        if (!refreshToken) {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage.UNAUTHORIZED_ACCESS
            });
        }

        const user = await this._tokenService.validateRefreshToken(refreshToken);

        if (!user || !user.type) {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage.UNAUTHORIZED_ACCESS
            });
        }

        const newAccessToken = this._tokenService.generateAccessToken(user.sub, user.email, user.type);

        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/',
        });

        return res.json({ success: true });
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
