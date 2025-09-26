import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '../enum/transaction.enum';
import { IGatewayDetails, ITxUserDetails } from '@core/entities/interfaces/transaction.entity.interface';

@Schema({ timestamps: true })
export class TransactionDocument extends Document {
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
        default: 'INR'
    })
    currency: string;

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
            bookingId: { type: Types.ObjectId, default: null },
            subscriptionId: { type: Types.ObjectId, default: null },
            breakup: {
                providerAmount: { type: Number, default: null },
                commission: { type: Number, default: null },
                gst: { type: Number, default: null }
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
export const TransactionSchema = SchemaFactory.createForClass(TransactionDocument)