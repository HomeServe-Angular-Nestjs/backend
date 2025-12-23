import { IWeeklyAvailability } from '@core/entities/interfaces/weekly-availability.entity.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ _id: false })
export class DayAvailability {

    @Prop({ type: Boolean, default: false })
    isAvailable: boolean;

    @Prop({
        type: [
            {
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
            },
        ],
        default: [],
    })
    timeRanges: { startTime: string; endTime: string }[];
}

export const DayAvailabilitySchema = SchemaFactory.createForClass(DayAvailability);

@Schema({ timestamps: true })
export class WeeklyAvailabilityDocument extends Document {

    @Prop({ type: Types.ObjectId, required: true, index: true, unique: true })
    providerId: Types.ObjectId;

    @Prop({
        type: {
            sun: { type: DayAvailabilitySchema, required: true },
            mon: { type: DayAvailabilitySchema, required: true },
            tue: { type: DayAvailabilitySchema, required: true },
            wed: { type: DayAvailabilitySchema, required: true },
            thu: { type: DayAvailabilitySchema, required: true },
            fri: { type: DayAvailabilitySchema, required: true },
            sat: { type: DayAvailabilitySchema, required: true },
        },
        required: true,
    })
    week: IWeeklyAvailability['week'];
}

export const WeeklyAvailabilitySchema = SchemaFactory.createForClass(WeeklyAvailabilityDocument);