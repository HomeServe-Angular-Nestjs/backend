import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { INotification } from "@core/entities/interfaces/notification.entity.interface";
import { NotificationTemplateId, NotificationType } from "@core/enum/notification.enum";

export class Notification extends BaseEntity implements INotification {
    userId: string;
    templateId: NotificationTemplateId;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    entityId?: string;
    metadata?: Record<string, any>;

    constructor(partial: Partial<Notification>) {
        super(partial);
        Object.assign(this, partial);
    }
}