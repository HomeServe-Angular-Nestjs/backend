import { Controller, Get, Inject, Injectable, InternalServerErrorException, Logger, Query, Req, UnauthorizedException } from "@nestjs/common";
import { CHAT_SOCKET_SERVICE_NAME } from "src/core/constants/service.constant";
import { IChatSocketService } from "../services/interface/chat-socket-service.interface";
import { IResponse } from "src/core/misc/response.util";
import { IChat, IChatData, IParticipant } from "src/core/entities/interfaces/chat.entity.interface";
import { ErrorMessage } from "src/core/enum/error.enum";
import { Request } from "express";
import { IPayload } from "src/core/misc/payload.interface";
import { Types } from "mongoose";
import { GetChatDto } from "../dto/chat.dto";
import { UserType } from "src/modules/auth/dtos/login.dto";

@Controller('chat')
export class ChatController {
    private readonly logger = new Logger(ChatController.name)
    constructor(
        @Inject(CHAT_SOCKET_SERVICE_NAME)
        private readonly _chatService: IChatSocketService
    ) { }

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