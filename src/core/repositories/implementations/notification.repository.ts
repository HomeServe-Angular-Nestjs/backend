import { NOTIFICATION_MODEL_NAME } from "@core/constants/model.constant";
import { NotificationTemplateId, NotificationType } from "@core/enum/notification.enum";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { INotificationRepository } from "@core/repositories/interfaces/notification-repo.interface";
import { NotificationDocument } from "@core/schema/notification.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationDocument> implements INotificationRepository {
    constructor(
        @InjectModel(NOTIFICATION_MODEL_NAME)
        private readonly _notificationModel: Model<NotificationDocument>
    ) {
        super(_notificationModel);
    }

    async findAll(userId: string): Promise<NotificationDocument[]> {
        return await this._notificationModel.find({ userId: this._toObjectId(userId) }).lean();
    }

    async findNotification(
        userId: string,
        type: NotificationType,
        templateId: NotificationTemplateId)
        : Promise<NotificationDocument | null> {
        return await this._notificationModel.findOne({
            userId: this._toObjectId(userId),
            type,
            templateId
        }).lean();
    }

    async markAsReadById(notificationId: string): Promise<NotificationDocument | null> {
        return await this._notificationModel.findOneAndUpdate(
            { _id: notificationId },
            { $set: { isRead: true } },
            { new: true }
        );
    }

    async deleteByUserIdAndTemplateId(userId: string, templateId: NotificationTemplateId): Promise<NotificationDocument | null> {
        const result = await this._notificationModel.findOneAndDelete(
            {
                userId: this._toObjectId(userId),
                templateId
            },
        );
        return result;
    }

}