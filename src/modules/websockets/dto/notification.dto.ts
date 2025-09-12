import { NotificationTemplateId, NotificationType } from "@core/enum/notification.enum";
import { IsEnum, IsIn, IsNotEmpty, IsString } from "class-validator";

export class NotificationIdDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}

export class SendNewNotificationDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(NotificationType))
    type: NotificationType;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(NotificationTemplateId))
    templateId: NotificationTemplateId;
}

export class TemplateIdDto {
    @IsNotEmpty()
    @IsString()
    @IsEnum(Object.values(NotificationTemplateId))
    templateId: NotificationTemplateId;
}