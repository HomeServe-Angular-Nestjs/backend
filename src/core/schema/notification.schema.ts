import { NotificationType } from "@core/enum/notification.enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class NotificationDocument {
    @Prop({
        type: String,
        required: true,
        index: true
    })
    userId: string;

    @Prop({
        type: String,
        enum: Object.values(NotificationType),
        required: true,
    })
    type: NotificationType;

    @Prop({
        type: String,
        required: true
    })
    title: string;

    @Prop({
        type: String,
        required: true
    })
    message: string;

    @Prop({
        type: Boolean,
        default: false
    })
    isRead: boolean;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: string;
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationDocument);