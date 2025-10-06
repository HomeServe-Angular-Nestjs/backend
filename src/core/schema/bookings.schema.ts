import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BookingStatus, CancelStatus, PaymentStatus } from '../enum/bookings.enum';
import { SlotStatusEnum } from '@core/enum/slot.enum';

@Schema({ _id: false })
export class ReviewDocument {
    @Prop({ type: String, required: true })
    desc: string;

    @Prop({ type: Number, required: true })
    rating: number;

    @Prop({ type: Date })
    writtenAt: Date;

    @Prop({ type: Boolean })
    isReported: boolean;

    @Prop({ type: Boolean })
    isActive: boolean;
}

@Schema({ _id: false })
export class SlotDocument {
    @Prop({
        type: Types.ObjectId,
        index: true,
        required: true
    })
    ruleId: Types.ObjectId;

    @Prop({
        type: Date,
        required: true
    })
    date: Date;

    @Prop({
        type: String,
        required: true
    })
    from: string;

    @Prop({
        type: String,
        required: true
    })
    to: string;

    @Prop({
        type: String,
        default: SlotStatusEnum.AVAILABLE,
        enum: Object.values(SlotStatusEnum)
    })
    status: SlotStatusEnum
}

@Schema({ timestamps: true })
export class BookingDocument extends Document {
    @Prop({ type: Types.ObjectId, required: true })
    customerId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true })
    providerId: Types.ObjectId;

    @Prop({ type: Number, required: true })
    totalAmount: number;

    @Prop({ type: Date })
    expectedArrivalTime: Date;

    @Prop({ type: Date, default: null })
    actualArrivalTime: Date | null;

    @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
    bookingStatus: BookingStatus;

    @Prop({ type: String, default: null })
    cancellationReason: string | null;

    @Prop({
        type: String,
        enum: Object.values(CancelStatus),
        default: null
    })
    cancelStatus: CancelStatus | null;

    @Prop({ type: Date, default: null })
    cancelledAt: Date | null;

    @Prop({
        type: {
            address: { type: String },
            coordinates: { type: [Number], index: '2dsphere' },
        },
    })
    location: {
        address: string;
        coordinates: [number, number];
    };

    @Prop({
        type: SlotDocument,
        required: true
    })
    slot: SlotDocument;

    @Prop({
        type: [
            {
                serviceId: { type: String },
                subserviceIds: { type: [String] },
            }
        ],
        required: true,
    })
    services: {
        serviceId: string;
        subserviceIds: string[];
    }[];

    @Prop({ type: Types.ObjectId, default: null })
    transactionId: Types.ObjectId | null;

    @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID })
    paymentStatus: PaymentStatus;

    @Prop({ type: ReviewDocument, default: null })
    review: ReviewDocument | null;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(BookingDocument);
BookingSchema.index(
    {
        'slot.ruleId': 1,
        'slot.date': 1,
        'slot.from': 1,
        'slot.to': 1
    },
    {
        unique: true,
        name: 'uniq_rule_date_time'
    }
);