import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { IScheduleDay } from "../entities/interfaces/schedules.entity.interface";

@Schema({ timestamps: true })
export class SchedulesDocumnet extends Document {
    @Prop({
        type: String,
        required: true
    })
    providerId: string;

    @Prop({
        type: String,
        required: true,
        match: /^\d{4}-(0[1-9]|1[0-2])$/  // Validates YYYY-MM format
    })
    month: string;

    @Prop({
        type: [{
            date: { type: String, required: true },
            slots: [{
                type: {
                    from: { type: String, required: true },
                    to: { type: String, required: true },
                    takenBy: { type: String, default: null },
                    isActive: { type: Boolean, default: true }
                }
            }],
            isActive: { type: Boolean, default: true }
        }]
    })
    days: IScheduleDay[];

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const SchedulesSchema = SchemaFactory.createForClass(SchedulesDocumnet);