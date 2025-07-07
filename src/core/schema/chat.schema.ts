import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { IBlockedInfo, IParticipant } from "../entities/interfaces/chat.entity.interface";

@Schema({ _id: false })
class Participant {
    @Prop({ type: Types.ObjectId, required: true })
    id: Types.ObjectId;

    @Prop({ type: String, enum: ['customer', 'provider', 'admin'], required: true })
    type: string;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

@Schema({ timestamps: true })
export class ChatDocument extends Document {
    @Prop({
        type: [ParticipantSchema],
        index: true
    })
    participants: [IParticipant, IParticipant];

    @Prop({ type: String, default: '' })
    lastMessage: string;

    @Prop({ type: Date })
    lastSeenAt: Date;

    @Prop({
        type: {
            by: { type: Types.ObjectId },
            at: { type: Date }
        },
        default: null
    })
    blockedInfo: IBlockedInfo | null;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(ChatDocument);

ChatSchema.index({ 'participants.id': 1, 'participants.type': 1, 'participants.role': 1 });