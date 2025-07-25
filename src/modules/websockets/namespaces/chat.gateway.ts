import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';

import {
    AUTH_SOCKET_SERVICE_NAME, CHAT_SOCKET_SERVICE_NAME, MESSAGE_SERVICE_NAME,
    USER_SOCKET_STORE_SERVICE_NAME
} from '@/core/constants/service.constant';
import { IParticipant } from '@/core/entities/interfaces/chat.entity.interface';
import { ICreateMessage, IMessage } from '@/core/entities/interfaces/message.entity.interface';
import { ErrorMessage } from '@/core/enum/error.enum';
import { FRONTEND_URL } from '@/core/environments/environments';
import { GlobalWsExceptionFilter } from '@/core/exception-filters/ws-exception.filters';
import {
    ICustomDtoValidator
} from '@/core/utilities/interface/custom-dto-validator.utility.interface';
import { CUSTOM_DTO_VALIDATOR_NAME } from '@core/constants/utility.constant';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { SendMessageDto } from '@modules/websockets/dto/message.dto';
import { BaseSocketGateway } from '@modules/websockets/namespaces/base.gateway';
import {
    IAuthSocketService
} from '@modules/websockets/services/interface/auth-socket-service.interface';
import {
    IChatSocketService
} from '@modules/websockets/services/interface/chat-socket-service.interface';
import { IMessageService } from '@modules/websockets/services/interface/message-service.interface';
import {
    IUserSocketStoreService
} from '@modules/websockets/services/interface/user-socket-store-service.interface';
import { Inject, NotFoundException, UnauthorizedException, UseFilters } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import {
    ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer
} from '@nestjs/websockets';

const cors: CorsOptions = {
    origin: FRONTEND_URL,
    credentials: true
}

@UseFilters(GlobalWsExceptionFilter)
@WebSocketGateway({ cors })
export class ChatGateway extends BaseSocketGateway {
    @WebSocketServer()
    private server: Server;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(AUTH_SOCKET_SERVICE_NAME)
        private readonly _authSocketService: IAuthSocketService,
        @Inject(USER_SOCKET_STORE_SERVICE_NAME)
        private readonly _userSocketService: IUserSocketStoreService,
        @Inject(CHAT_SOCKET_SERVICE_NAME)
        private readonly _chatSocketService: IChatSocketService,
        @Inject(MESSAGE_SERVICE_NAME)
        private readonly _messageService: IMessageService,
        @Inject(CUSTOM_DTO_VALIDATOR_NAME)
        private readonly _customDtoValidatorUtility: ICustomDtoValidator
    ) {
        super()
        this.logger = this.loggerFactory.createLogger(ChatGateway.name);

    }

    protected override async onClientConnect(client: Socket): Promise<void> {
        try {
            const token = this._authSocketService.extractTokenFromCookie(client);
            const payload = await this._authSocketService.validateTokenWithRetry(token);

            if (!payload.sub || !payload.type) {
                throw new Error('Payload not found');
            }

            const userId = payload.sub;
            const roomName = `user_${payload.sub}`;
            client.data.user = { id: payload.sub, type: payload.type };

            await this._userSocketService.addSocket(userId, client.id);

            client.join(roomName);
        } catch (err) {
            this.logger.error(ErrorMessage.UNAUTHORIZED_ACCESS);
            client.emit('auth-error', ErrorMessage.UNAUTHORIZED_ACCESS);
            client.disconnect();
        }
    }

    protected override async onClientDisConnect(client: Socket): Promise<void> {
        const user = client.data.user;
        if (user?.id) {
            await this._userSocketService.removeSocket(user.id, client.id);
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: SendMessageDto) {
        try {
            const bodyPayload = await this._customDtoValidatorUtility.validateDto(SendMessageDto, body);

            const fromUser = client.data.user;
            if (!fromUser) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            };

            const sender: IParticipant = {
                id: new Types.ObjectId(fromUser.id as string),
                type: fromUser.type,
            };

            const receiver: IParticipant = {
                id: new Types.ObjectId(bodyPayload.receiverId),
                type: bodyPayload.type,
            }

            let chat = await this._chatSocketService.findChat(sender, receiver);

            if (!chat) {
                chat = await this._chatSocketService.createChat(sender, receiver);
            }


            const messageData: ICreateMessage = {
                chatId: new Types.ObjectId(chat.id),
                content: bodyPayload.message,
                senderId: sender.id,
                messageType: 'text',
                receiverId: receiver.id,
            }

            const newMessage = await this._messageService.createMessage(messageData);

            if (!newMessage) {
                this.logger.error('Error creating new message.');
                throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
            }

            const senderSockets = await this._userSocketService.getSockets(receiver.id.toString());
            const receiverSockets = await this._userSocketService.getSockets(sender.id.toString());

            const allSockets = [...new Set([...senderSockets, ...receiverSockets])];

            for (const socketId of allSockets) {
                this.server.to(socketId).emit('newMessage', newMessage);
            }
        } catch (err) {
            this.logger.error('Caught error in send new message socket:', err);
            throw err;
        }
    }
}

