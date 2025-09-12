import { NOTIFICATION_MAPPER } from "@core/constants/mappers.constant";
import { NOTIFICATION_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { INotificationMapper } from "@core/dto-mapper/interface/notification.mapper.interface";
import { INotification } from "@core/entities/interfaces/notification.entity.interface";
import { NotificationType, NotificationTemplateId } from "@core/enum/notification.enum";
import { IResponse } from "@core/misc/response.util";
import { INotificationRepository } from "@core/repositories/interfaces/notification-repo.interface";
import { SendNewNotificationDto } from "@modules/websockets/dto/notification.dto";
import { INotificationService } from "@modules/websockets/services/interface/notification-service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class NotificationService implements INotificationService {
    constructor(
        @Inject(NOTIFICATION_REPOSITORY_NAME)
        private readonly _notificationRepository: INotificationRepository,
        @Inject(NOTIFICATION_MAPPER)
        private readonly _notificationMapper: INotificationMapper,
    ) { }

    async createNotification(userId: string, body: SendNewNotificationDto): Promise<INotification> {
        const newNotification = await this._notificationRepository.create(this._notificationMapper.toDocument({
            userId,
            templateId: body.templateId,
            type: body.type,
            title: body.title,
            message: body.message,
        }));

        return this._notificationMapper.toEntity(newNotification);
    }

    async fetchAll(userId: string): Promise<IResponse<INotification[]>> {
        const notificationDoc = await this._notificationRepository.findAll(userId);
        return {
            success: true,
            message: 'Notifications fetched.',
            data: (notificationDoc ?? []).map(notification => this._notificationMapper.toEntity(notification))
        }
    }

    async findNotification(userId: string, type: NotificationType, templateId: NotificationTemplateId): Promise<INotification | null> {
        const notificationDoc = await this._notificationRepository.findNotification(userId, type, templateId);
        return notificationDoc ? this._notificationMapper.toEntity(notificationDoc) : null;
    }

    async markAsReadById(notificationId: string): Promise<INotification | null> {
        const notificationDoc = await this._notificationRepository.markAsReadById(notificationId);
        return notificationDoc ? this._notificationMapper.toEntity(notificationDoc) : null;
    }

    async deleteByUserIdAndTemplateId(userId: string, templateId: NotificationTemplateId): Promise<INotification | null> {
        const deletedDoc = await this._notificationRepository.deleteByUserIdAndTemplateId(userId, templateId);
        return deletedDoc ? this._notificationMapper.toEntity(deletedDoc) : null;
    }
}