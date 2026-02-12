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
        return await this._notificationModel.find({ userId: this._toObjectId(userId) })
            .sort({ createdAt: -1 }).lean();
    }

    async findNotification(userId: string, type: NotificationType, templateId: NotificationTemplateId)
        : Promise<NotificationDocument | null> {
        return await this._notificationModel.findOne({
            userId: this._toObjectId(userId),
            type,
            templateId,
            isDeleted: false,
        }).lean();
    }

    async markAsReadById(notificationId: string): Promise<NotificationDocument | null> {
        return await this._notificationModel.findOneAndUpdate(
            { _id: notificationId },
            { $set: { isRead: true } },
            { new: true }
        );
    }

    async markAllAsRead(userId: string): Promise<boolean> {
        const result = await this._notificationModel.updateMany(
            { userId: this._toObjectId(userId), isRead: false },
            { $set: { isRead: true } }
        );
        return result.modifiedCount > 0;
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

    async deleteById(notificationId: string): Promise<boolean> {
        const result = await this._notificationModel.deleteOne({ _id: notificationId });
        return result.deletedCount > 0;
    }

    async deleteAll(userId: string): Promise<void> {
        await this._notificationModel.deleteMany({ userId: this._toObjectId(userId) });
    }

}