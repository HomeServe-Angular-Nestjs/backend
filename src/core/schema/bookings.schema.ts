import mongoose, { Document, Types } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BookingStatus, CancelStatus, PaymentStatus } from '../enum/bookings.enum';
import { ISlotResponse } from '@core/entities/interfaces/slot-rule.entity.interface';

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

    @Prop({ type: Date, default: null }) G
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
        type: Types.ObjectId,
        required: true,
        index: true
    })
    slotId: Types.ObjectId | string;

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

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(BookingDocument);