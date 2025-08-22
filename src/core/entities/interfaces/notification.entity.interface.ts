import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { NotificationType } from "@core/enum/notification.enum";

export interface INotification extends IEntity {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
}