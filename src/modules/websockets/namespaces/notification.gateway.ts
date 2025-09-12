import { Inject, InternalServerErrorException, NotFoundException, UseFilters } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AUTH_SOCKET_SERVICE_NAME, NOTIFICATION_SERVICE_NAME, USER_SOCKET_STORE_SERVICE_NAME } from "@core/constants/service.constant";
import { CUSTOM_DTO_VALIDATOR_NAME } from "@core/constants/utility.constant";
import { GlobalWsExceptionFilter } from "@core/exception-filters/ws-exception.filters";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { ICustomDtoValidator } from "@core/utilities/interface/custom-dto-validator.utility.interface";
import { TemplateIdDto, NotificationIdDto, SendNewNotificationDto } from "@modules/websockets/dto/notification.dto";
import { BaseSocketGateway, corsOption, IClientData } from "@modules/websockets/namespaces/base.gateway";
import { IAuthSocketService } from "@modules/websockets/services/interface/auth-socket-service.interface";
import { IUserSocketStoreService } from "@modules/websockets/services/interface/user-socket-store-service.interface";
import { NotificationTemplateId, NotificationType } from "@core/enum/notification.enum";
import { UserType } from "@modules/auth/dtos/login.dto";
import { INotificationService } from "@modules/websockets/services/interface/notification-service.interface";
import { ErrorCodes } from "@core/enum/error.enum";

const NAMESPACE = 'notification';
const NEW_NOTIFICATION = 'notification:new';
const MARK_AS_READ = 'notification:read';
const REMOVE_NOTIFICATION = 'notification:remove';

@UseFilters(GlobalWsExceptionFilter)
@WebSocketGateway({ cors: corsOption, namespace: NAMESPACE })
export class NotificationGateway extends BaseSocketGateway {
    @WebSocketServer()
    private server: Server;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(AUTH_SOCKET_SERVICE_NAME)
        private readonly _authSocketService: IAuthSocketService,
        @Inject(USER_SOCKET_STORE_SERVICE_NAME)
        private readonly _userSocketService: IUserSocketStoreService,
        @Inject(CUSTOM_DTO_VALIDATOR_NAME)
        private readonly _customDtoValidatorUtility: ICustomDtoValidator,
        @Inject(NOTIFICATION_SERVICE_NAME)
        private readonly _notificationService: INotificationService,
    ) {
        super();
        this.logger = this._loggerFactory.createLogger(NotificationGateway.name);
    }

    protected override async onClientConnect(client: Socket): Promise<void> {
        try {
            const payload = await this._authSocketService.validateToken(client);
            const { sub: userId, type: userType } = payload;

            client.data.user = { id: userId, type: userType };

            await this._userSocketService.addSocket(userId, client.id, 'notification');
            this.logger.log(`User ${userId} connected to notifications with socket ID: ${client.id}`);
        } catch (error) {
            this.logger.error('Notification token verification failed');
            client.emit('token:expired');
            setTimeout(() => client.disconnect(), 200);
        }
    }

    protected override async onClientDisConnect(client: Socket): Promise<void> {
        const user = client.data.user;
        if (user?.id) {
            await this._userSocketService.removeSocket(user.id, client.id, 'notification');
        }
    }

    private _getClient(client: Socket): { id: string, type: UserType } {
        return client.data.user;
    }

    @SubscribeMessage(NEW_NOTIFICATION)
    async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: SendNewNotificationDto) {
        await this._customDtoValidatorUtility.validateDto(SendNewNotificationDto, body);

        const user = client.data.user as IClientData;
        if (body.type === NotificationType.SYSTEM) {
            let notification = await this._notificationService.findNotification(user.id, body.type, body.templateId);

            if (!notification) {
                notification = await this._notificationService.createNotification(user.id, {
                    templateId: body.templateId,
                    type: body.type,
                    title: body.title,
                    message: body.message,
                });
            }

            const senderSockets = await this._userSocketService.getSockets(user.id, NAMESPACE);
            for (const socketId of senderSockets) {
                this.server.to(socketId).emit(NEW_NOTIFICATION, notification);
            }
        }
    }

    @SubscribeMessage(MARK_AS_READ)
    async markAsRead(@ConnectedSocket() client: Socket, @MessageBody() body: NotificationIdDto) {
        await this._customDtoValidatorUtility.validateDto(NotificationIdDto, body);
        const user = this._getClient(client);

        const markedNotification = await this._notificationService.markAsReadById(body.id);
        if (!markedNotification) {
            this.logger.error('Failed to update isRead in notification document.');
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Failed to update.'
            });
        }

        const senderSockets = await this._userSocketService.getSockets(user.id, NAMESPACE);
        for (const socketId of senderSockets) {
            this.server.to(socketId).emit(MARK_AS_READ, markedNotification);
        }
    }

    @SubscribeMessage(REMOVE_NOTIFICATION)
    async removeMessage(@ConnectedSocket() client: Socket, @MessageBody() body: TemplateIdDto) {
        await this._customDtoValidatorUtility.validateDto(TemplateIdDto, body);
        const user = this._getClient(client);

        const removedNotification = await this._notificationService.deleteByUserIdAndTemplateId(user.id, body.templateId);
        if (!removedNotification) {
            this.logger.error('Failed to remove in notification of ID: ', body.templateId);
            throw new NotFoundException({
                code: ErrorCodes.DATABASE_OPERATION_FAILED,
                message: 'Failed to remove.'
            });
        }

        const senderSockets = await this._userSocketService.getSockets(user.id, NAMESPACE);
        for (const socketId of senderSockets) {
            this.server.to(socketId).emit(MARK_AS_READ, removedNotification.id);
        }

    }
}