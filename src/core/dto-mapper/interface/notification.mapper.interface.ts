import type { INotification } from '@core/entities/interfaces/notification.entity.interface';
import type { NotificationDocument } from '@core/schema/notification.schema';

export interface INotificationMapper {
  toEntity(doc: NotificationDocument): INotification;
  toDocument(entity: Partial<INotification>): Partial<NotificationDocument>;
}
