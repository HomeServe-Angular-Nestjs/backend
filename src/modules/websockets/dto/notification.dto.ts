import { NotificationTemplateId, NotificationType } from "@core/enum/notification.enum";
import { IsEnum, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, Min } from "class-validator";

export class NotificationQueryDto {
    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}

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

    @IsOptional()
    @IsString()
    entityId?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

export class TemplateIdDto {
    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(NotificationTemplateId))
    templateId: NotificationTemplateId;
}
