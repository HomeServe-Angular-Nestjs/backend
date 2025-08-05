import { WeekType } from "@core/entities/interfaces/slot-rule.entity.interface";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class SlotRuleDocument extends Document {
    @Prop({
        type: Types.ObjectId,
        required: true
    })
    providerId: Types.ObjectId

    @Prop({
        type: String,
        required: true
    })
    name: string;

    @Prop({
        type: String,
        required: true
    })
    description: string;

    @Prop({
        type: Date,
        required: true
    })
    startDate: Date;

    @Prop({
        type: Date,
        required: true
    })
    endDate: Date;


    @Prop({
        type: [String],
        required: true,
    })
    daysOfWeek: WeekType[];

    @Prop({
        type: String,
        required: true
    })
    startTime: string;

    @Prop({
        type: String,
        required: true
    })
    endTime: string;

    @Prop({
        type: Number,
        required: true
    })
    slotDuration: number;

    @Prop({
        type: Number,
        required: true
    })
    breakDuration: number;

    @Prop({ type: Number })
    capacity: number;

    @Prop({
        type: Boolean,
        default: true
    })
    isActive: boolean;

    @Prop({ type: Number })
    priority: number;

    @Prop({ type: [Date] })
    excludeDates: Date[];
}

export const SlotRuleSchema = SchemaFactory.createForClass(SlotRuleDocument);