import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class ScheduleDocument extends Document {
    @Prop({ required: true })
    scheduleDate: string;

    @Prop({
        type: [{
            from: String,
            to: String,
            takenBy: String
        }]
    })
    slots: {
        from: string;
        to: string
        takenBy: string
    }[];
}

export const ScheduleSchema = SchemaFactory.createForClass(ScheduleDocument);

