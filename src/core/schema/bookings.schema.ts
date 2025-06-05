import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BookingStatus, PaymentStatus } from '../enum/bookings.enum';

@Schema({ timestamps: true })
export class BookingDocument extends Document {
    @Prop({ type: String, required: true })
    customerId: string;

    @Prop({ type: String, required: true })
    providerId: string;

    @Prop({ type: Number, required: true })
    totalAmount: number;

    @Prop({ type: Date })
    expectedArrivalTime: Date;

    @Prop({ type: Date, default: null })
    actualArrivalTime: Date;

    @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
    bookingStatus: BookingStatus;

    @Prop({ type: String, default: null })
    cancellationReason: string;

    @Prop({ type: Date, default: null })
    cancelledAt: Date;

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

    @Prop({ type: String, required: true })
    scheduleId: string;

    @Prop({ type: String, required: true })
    slotId: string;

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

    @Prop({ type: String, default: null })
    transactionId: string;

    @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID })
    paymentStatus: PaymentStatus;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(BookingDocument);
