import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { INotification } from "@core/entities/interfaces/notification.entity.interface";
import { NotificationType } from "@core/enum/notification.enum";

export class Notification extends BaseEntity implements INotification {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;

    constructor(partial: Partial<Notification>) {
        super(partial);
        Object.assign(this, partial);
    }
}