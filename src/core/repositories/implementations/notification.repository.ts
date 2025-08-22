import { NOTIFICATION_MODEL_NAME } from "@core/constants/model.constant";
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
}