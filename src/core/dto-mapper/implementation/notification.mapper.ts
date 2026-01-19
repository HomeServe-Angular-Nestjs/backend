import { INotificationMapper } from "@core/dto-mapper/interface/notification.mapper.interface";
import { Notification } from "@core/entities/implementation/notification.entity";
import { INotification } from "@core/entities/interfaces/notification.entity.interface";
import { NotificationDocument } from "@core/schema/notification.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class NotificationMapper implements INotificationMapper {
    toEntity(doc: NotificationDocument): INotification {
        return new Notification({
            id: (doc._id as Types.ObjectId).toString(),
            userId: doc.userId.toString(),
            templateId: doc.templateId,
            type: doc.type,
            title: doc.title,
            message: doc.message,
            isRead: doc.isRead,
            entityId: doc.entityId,
            metadata: doc.metadata,
            updatedAt: new Date(doc.updatedAt),
            createdAt: new Date(doc.createdAt)
        });
    }

    toDocument(entity: Omit<INotification, 'id'>): Partial<NotificationDocument> {
        return {
            userId: new Types.ObjectId(entity.userId),
            type: entity.type,
            title: entity.title,
            templateId: entity.templateId,
            message: entity.message,
            isRead: entity.isRead,
            entityId: entity.entityId,
            metadata: entity.metadata,
        };
    }
}