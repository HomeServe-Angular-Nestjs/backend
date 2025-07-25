import { Document, Types } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { MessageType } from '../entities/interfaces/message.entity.interface';

@Schema({ timestamps: true })
export class MessageDocument extends Document {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    chatId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    senderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    receiverId: Types.ObjectId;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({
        type: String,
        enum: ['text', 'image', 'file', 'audio', 'video'],
        default: 'text'
    })
    messageType: MessageType;

    @Prop({ type: [String], default: [] })
    attachments: string[];

    @Prop({ type: Boolean, default: false })
    isRead: boolean;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);

MessageSchema.index({ chatId: 1, createdAt: -1 });

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

MessageSchema.index({ receiverId: 1, isRead: 1 });
