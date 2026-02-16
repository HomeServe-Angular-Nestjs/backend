import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BookingStatus, CancelStatus, PaymentStatus } from '../enum/bookings.enum';
import { SlotStatusEnum } from '@core/enum/slot.enum';
import { COUPON_MODEL_NAME, CUSTOMER_MODEL_NAME, PROVIDER_SERVICE_MODEL_NAME } from '@core/constants/model.constant';
import { CurrencyType, PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';
import { IGatewayDetails, ITxUserDetails } from '@core/entities/interfaces/transaction.entity.interface';

@Schema()
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
        default: SlotStatusEnum.ON_HOLD,
        enum: Object.values(SlotStatusEnum)
    })
    status: SlotStatusEnum
}

@Schema({ timestamps: true })
export class TransactionDocument {
    _id?: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true
    })
    userId: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        enum: Object.values(TransactionType)
    })
    transactionType: TransactionType

    @Prop({
        type: String,
        enum: Object.values(PaymentDirection),
        required: true
    })
    direction: PaymentDirection;

    @Prop({
        type: String,
        enum: Object.values(PaymentSource),
        required: true
    })
    source: PaymentSource;

    @Prop({
        type: String,
        enum: Object.values(TransactionStatus),
        required: true
    })
    status: TransactionStatus;

    @Prop({
        type: Number,
        required: true
    })
    amount: number;

    @Prop({
        type: String,
        default: CurrencyType.INR,
        enum: Object.values(CurrencyType)
    })
    currency: CurrencyType;

    @Prop({
        type: {
            orderId: { type: String, },
            paymentId: { type: String },
            signature: { type: String },
            receipt: { type: String },
        },
        default: null,
        _id: false,
    })
    gateWayDetails: IGatewayDetails | null;

    @Prop({
        type: {
            email: { type: String },
            contact: { type: String },
            role: { type: String },
            _id: false
        }
    })
    userDetails: ITxUserDetails | null;

    @Prop({
        type: {
            bookingId: { type: Types.ObjectId },
            subscriptionId: { type: Types.ObjectId },
            breakup: {
                type: {
                    providerAmount: { type: Number },
                    commission: { type: Number },
                    gst: { type: Number },
                },
                default: null
            }
        },
        default: null,
        _id: false
    })
    metadata: {
        bookingId: Types.ObjectId | null;
        subscriptionId: Types.ObjectId | null;
        breakup: {
            providerAmount: number | null;
            commission: number | null;
            gst: number | null;
        }
    } | null;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

@Schema({ timestamps: true })
export class BookingDocument extends Document {
    @Prop({ type: Types.ObjectId, ref: CUSTOMER_MODEL_NAME, required: true })
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
        _id: false
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
        type: [Types.ObjectId],
        ref: PROVIDER_SERVICE_MODEL_NAME,
        minlength: 1,
        required: true
    })
    services: Types.ObjectId[];

    @Prop({ type: [TransactionDocument], default: [] })
    transactionHistory: TransactionDocument[];

    @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID })
    paymentStatus: PaymentStatus;

    @Prop({ type: ReviewDocument, default: null })
    review: ReviewDocument | null;

    @Prop({ type: Date, default: null })
    respondedAt: Date | null;

    @Prop({ type: Types.ObjectId, ref: COUPON_MODEL_NAME, default: null })
    couponId: Types.ObjectId | null;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(BookingDocument);

BookingSchema.index(
    {
        'providerId': 1,
        'slot.date': 1,
        'slot.from': 1,
        'slot.to': 1
    },
    {
        unique: true,
        name: 'uniq_booking_slot_date_time'
    }
);