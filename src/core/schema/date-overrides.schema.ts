import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class DateOverrideDocument extends Document {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    providerId: Types.ObjectId;

    @Prop({ type: Date, required: true, index: true })
    date: Date; // normalized

    @Prop({
        type: [
            {
                startTime: { type: String, required: true }, // "11:00"
                endTime: { type: String, required: true },   // "16:00"
            },
        ],
        id: false,
        default: [],
    })
    timeRanges: { startTime: string; endTime: string }[];

    @Prop({ type: Boolean, default: false })
    isAvailable: boolean;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const DateOverrideSchema = SchemaFactory.createForClass(DateOverrideDocument);
