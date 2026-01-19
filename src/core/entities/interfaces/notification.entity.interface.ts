import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { NotificationTemplateId, NotificationType } from "@core/enum/notification.enum";

export interface INotification extends IEntity {
    userId: string;
    templateId: NotificationTemplateId,
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    entityId?: string;
    metadata?: Record<string, any>;
}

export interface ISendNewNotification {
    type: NotificationType;
    message: string;
    title: string;
    templateId: NotificationTemplateId;
    entityId?: string;
    metadata?: Record<string, any>;
}