import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class ScheduleDocument extends Document {
    @Prop({ required: true, unique: true })
    scheduleDate: string;

    @Prop({
        type: [{
            from: { type: String },
            to: { type: String },
            takenBy: { type: String, default: null }
        }]
    })
    slots: {
        from: string;
        to: string
        takenBy: string | null
    }[];

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const ScheduleSchema = SchemaFactory.createForClass(ScheduleDocument);

