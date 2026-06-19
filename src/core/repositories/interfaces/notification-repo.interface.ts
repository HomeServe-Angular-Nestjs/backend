import { NotificationTemplateId, NotificationType } from "@core/enum/notification.enum";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { NotificationDocument } from "@core/schema/notification.schema";

export interface INotificationRepository extends IBaseRepository<NotificationDocument> {
    findNotification(userId: string, type: NotificationType, templateId: NotificationTemplateId): Promise<NotificationDocument | null>;
    findAll(userId: string): Promise<NotificationDocument[]>;
    markAsReadById(userId: string, notificationId: string): Promise<NotificationDocument | null>;
    markAllAsRead(userId: string): Promise<boolean>;
    deleteByUserIdAndTemplateId(userId: string, templateId: NotificationTemplateId): Promise<NotificationDocument | null>;
    deleteAll(userId: string): Promise<void>;
    deleteById(userId: string, notificationId: string): Promise<boolean>
}
