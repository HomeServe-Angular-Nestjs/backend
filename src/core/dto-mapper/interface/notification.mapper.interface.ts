import { INotification } from "@core/entities/interfaces/notification.entity.interface";
import { NotificationDocument } from "@core/schema/notification.schema";

export interface INotificationMapper {
    toEntity(doc: NotificationDocument): INotification;
    toDocument(entity: Partial<INotification>): Partial<NotificationDocument>;
}