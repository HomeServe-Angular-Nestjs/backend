import { INotification } from "@core/entities/interfaces/notification.entity.interface";
import { NotificationTemplateId, NotificationType } from "@core/enum/notification.enum";
import { IResponse } from "@core/misc/response.util";
import { SendNewNotificationDto } from "@modules/websockets/dto/notification.dto";

export interface INotificationService {
    createNotification(userId: string, body: SendNewNotificationDto): Promise<INotification>;
    fetchAll(userId: string): Promise<IResponse<INotification[]>>;
    findNotification(userId: string, type: NotificationType, templateId: NotificationTemplateId): Promise<INotification | null>;
    markAsReadById(notificationId: string): Promise<INotification | null>;
    deleteByUserIdAndTemplateId(userId: string, templateId: NotificationTemplateId): Promise<INotification | null>
}