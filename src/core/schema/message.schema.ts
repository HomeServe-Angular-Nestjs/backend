import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export class MessageDocument extends Document {

    @Prop({
        type: Types.ObjectId,
        required: true,
        index: true
    })
    chatId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
        index: true
    })
    senderId: Types.ObjectId;

    @Prop({ type: String })
    content: string;

    @Prop({
        type: String,
        enum: ['text', 'image', 'file', 'audio', 'video'],
        default: 'text'
    })
    messageType: MessageType;

    @Prop({ type: [String], default: [] })
    attachments?: string[];

    @Prop({
        type: String,
        default: '',
    })
    lastMessage: string;

    @Prop({ type: Boolean, default: false })
    isRead: boolean;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);