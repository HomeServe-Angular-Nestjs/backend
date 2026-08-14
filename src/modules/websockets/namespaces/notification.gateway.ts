import { Inject, NotFoundException, UseFilters } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AUTH_SOCKET_SERVICE_NAME, NOTIFICATION_SERVICE_NAME, USER_SOCKET_STORE_SERVICE_NAME } from '@core/constants/service.constant';
import { CUSTOM_DTO_VALIDATOR_NAME } from '@core/constants/utility.constant';
import { GlobalWsExceptionFilter } from '@core/exception-filters/ws-exception.filters';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomDtoValidator } from '@core/utilities/interface/custom-dto-validator.utility.interface';
import { TemplateIdDto, NotificationIdDto, SendNewNotificationDto } from '@modules/websockets/dto/notification.dto';
import { BaseSocketGateway, corsOption } from '@modules/websockets/namespaces/base.gateway';
import { IAuthSocketService } from '@modules/websockets/services/interface/auth-socket-service.interface';
import { IUserSocketStoreService } from '@modules/websockets/services/interface/user-socket-store-service.interface';
import { NotificationType } from '@core/enum/notification.enum';
import { INotificationService } from '@modules/websockets/services/interface/notification-service.interface';
import { INotification } from '@core/entities/interfaces/notification.entity.interface';
import { ErrorCodes } from '@core/enum/error.enum';

const namespace = 'notification';
const NEW_NOTIFICATION = 'notification:new';
const MARK_AS_READ = 'notification:read';
const REMOVE_NOTIFICATION = 'notification:remove';

@UseFilters(GlobalWsExceptionFilter)
@WebSocketGateway({ cors: corsOption, namespace })
export class NotificationGateway extends BaseSocketGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    @Inject(LOGGER_FACTORY)
    loggerFactory: ILoggerFactory,
    @Inject(AUTH_SOCKET_SERVICE_NAME)
    authSocketService: IAuthSocketService,
    @Inject(USER_SOCKET_STORE_SERVICE_NAME)
    userSocketService: IUserSocketStoreService,
    @Inject(CUSTOM_DTO_VALIDATOR_NAME)
    private readonly _customDtoValidatorUtility: ICustomDtoValidator,
    @Inject(NOTIFICATION_SERVICE_NAME)
    private readonly _notificationService: INotificationService,
  ) {
    super(loggerFactory, authSocketService, userSocketService, namespace);
  }

  protected override async onClientConnect(client: Socket): Promise<void> {
    await this._authenticate(client);
  }

  protected override async onClientDisConnect(client: Socket): Promise<void> {
    await this._unauthenticate(client);
  }

  @SubscribeMessage(NEW_NOTIFICATION)
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() body: SendNewNotificationDto) {
    await this._customDtoValidatorUtility.validateDto(SendNewNotificationDto, body);

    const user = this._getClient(client);
    if (!user?.id) return;
    if (body.type === NotificationType.SYSTEM) {
      let notification = await this._notificationService.findNotification(user.id, body.type, body.templateId);

      if (!notification) {
        notification = await this._notificationService.createNotification(user.id, {
          templateId: body.templateId,
          type: body.type,
          title: body.title,
          message: body.message,
        });
      } else {
        await this.sendNotification(user.id, notification);
      }
    }
  }

  @SubscribeMessage(MARK_AS_READ)
  async markAsRead(@ConnectedSocket() client: Socket, @MessageBody() body: NotificationIdDto) {
    await this._customDtoValidatorUtility.validateDto(NotificationIdDto, body);
    const user = this._getClient(client);
    if (!user?.id) return;

    const response = await this._notificationService.markAsReadById(user.id, body.id);
    if (!response.data) {
      this.logger.error('Failed to update isRead in notification document.');
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: 'Failed to update.',
      });
    }

    const senderSockets = await this._userSocketService.getSockets(user.id, namespace);
    for (const socketId of senderSockets) {
      this.server.to(socketId).emit(MARK_AS_READ, response.data);
    }
  }

  @SubscribeMessage(REMOVE_NOTIFICATION)
  async removeMessage(@ConnectedSocket() client: Socket, @MessageBody() body: TemplateIdDto) {
    await this._customDtoValidatorUtility.validateDto(TemplateIdDto, body);
    const user = this._getClient(client);
    if (!user?.id) return;

    const removedNotification = await this._notificationService.deleteByUserIdAndTemplateId(user.id, body.templateId);
    if (!removedNotification) {
      return;
    }

    const senderSockets = await this._userSocketService.getSockets(user.id, namespace);
    for (const socketId of senderSockets) {
      this.server.to(socketId).emit(REMOVE_NOTIFICATION, removedNotification.id);
    }
  }

  public async sendNotification(userId: string, notification: INotification) {
    const senderSockets = await this._userSocketService.getSockets(userId, namespace);
    for (const socketId of senderSockets) {
      this.server.to(socketId).emit(NEW_NOTIFICATION, notification);
    }
  }
}
