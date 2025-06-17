import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class ChatDocument extends Document {
    @Prop({
        type: [Types.ObjectId],
        required: true,
        validate: [(val: Types.ObjectId[]) => val.length === 2, 'Chat must have 2 paricipants'],
        index: true
    })
    participants: Types.ObjectId[];

    @Prop({ type: Date })
    lastSeenAt: Date;

    @Prop({ type: Boolean })
    isBlocked: boolean;

    @Prop({ type: Types.ObjectId })
    blockedBy: Types.ObjectId;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(ChatDocument);
