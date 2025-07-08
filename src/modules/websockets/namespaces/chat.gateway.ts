import { Inject, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Types } from "mongoose";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { BaseSocketGateway } from "./base.gateway";
import { FRONTEND_URL } from "src/core/environments/environments";
import { AUTH_SOCKET_SERVICE_NAME, CHAT_SOCKET_SERVICE_NAME, MESSAGE_SERVICE_NAME, USER_SOCKET_STORE_SERVICE_NAME } from "src/core/constants/service.constant";
import { IAuthSocketService } from "../services/interface/auth-socket-service.interface";
import { ErrorMessage } from "src/core/enum/error.enum";
import { IUserSocketStoreService } from "../services/interface/user-socket-store-service.interface";
import { IChatSocketService } from "../services/interface/chat-socket-service.interface";
import { IMessageService } from "../services/interface/message-service.interface";
import { SendMessageDto } from "../dto/message.dto";
import { CUSTOM_DTO_VALIDATOR_NAME } from "src/core/constants/utility.constant";
import { ICustomDtoValidator } from "src/core/utilities/interface/custom-dto-validator.utility.interface";
import { ICreateMessage, IMessage } from "src/core/entities/interfaces/message.entity.interface";
import { IParticipant } from "src/core/entities/interfaces/chat.entity.interface";

const cors: CorsOptions = {
    origin: FRONTEND_URL,
    credentials: true
}

@WebSocketGateway({ cors })
export class ChatGateway extends BaseSocketGateway {
    @WebSocketServer()
    private server: Server;

    constructor(
        @Inject(AUTH_SOCKET_SERVICE_NAME)
        private readonly _authSokectService: IAuthSocketService,
        @Inject(USER_SOCKET_STORE_SERVICE_NAME)
        private readonly _userSocketService: IUserSocketStoreService,
        @Inject(CHAT_SOCKET_SERVICE_NAME)
        private readonly _chatSocketService: IChatSocketService,
        @Inject(MESSAGE_SERVICE_NAME)
        private readonly _messageService: IMessageService,
        @Inject(CUSTOM_DTO_VALIDATOR_NAME)
        private readonly _customDtoValidatorUtility: ICustomDtoValidator
    ) { super() }

    protected override async onClientConnect(client: Socket): Promise<void> {
        try {
            const token = this._authSokectService.extractTokenFromCookie(client);
            const payload = await this._authSokectService.validateTokenWithRetry(token);

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


            const mesageData: ICreateMessage = {
                chatId: new Types.ObjectId(chat.id),
                content: bodyPayload.message,
                senderId: sender.id,
                messageType: 'text',
                receiverId: receiver.id,
            }

            const newMessage = await this._messageService.createMessage(mesageData);

            if (!newMessage) {
                this.logger.error('Error creating new message.');
                throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
            }

            const senderSockets = await this._userSocketService.getsockets(receiver.id.toString());
            const receiverSockets = await this._userSocketService.getsockets(sender.id.toString());

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

