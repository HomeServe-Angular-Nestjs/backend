import type { INotification, INotificationPage } from '@core/entities/interfaces/notification.entity.interface';
import type { NotificationTemplateId, NotificationType } from '@core/enum/notification.enum';
import type { IResponse } from '@core/misc/response.util';
import type { SendNewNotificationDto } from '@modules/websockets/dto/notification.dto';

export interface INotificationService {
  createNotification(userId: string, body: SendNewNotificationDto): Promise<INotification>;
  fetchAll(userId: string, cursor?: string, limit?: number): Promise<IResponse<INotificationPage>>;
  findNotification(userId: string, type: NotificationType, templateId: NotificationTemplateId): Promise<INotification | null>;
  markAsReadById(userId: string, notificationId: string): Promise<IResponse<INotification>>;
  markAllAsRead(userId: string): Promise<IResponse<INotification[]>>;
  deleteByUserIdAndTemplateId(userId: string, templateId: NotificationTemplateId): Promise<INotification | null>;
  deleteById(userId: string, notificationId: string): Promise<IResponse<void>>;
  deleteAll(userId: string): Promise<IResponse<void>>;
}
