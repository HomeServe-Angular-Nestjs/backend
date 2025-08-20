import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '../enum/transaction.enum';

@Schema({ timestamps: true })
export class TransactionDocument extends Document {
    @Prop({
        type: String,
        required: true
    })
    userId: string;

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
            orderId: { type: String, required: true },
            paymentId: { type: String, required: true },
            signature: { type: String, required: true },
            receipt: { type: String },
            // card
        }
    })
    gateWayDetails: {
        orderId: string,
        paymentId: string,
        signature: string,
        receipt: string | null,
    }

    @Prop({
        type: {
            email: { type: String, required: true },
            contact: { type: String, required: true }
        }
    })
    userDetails: {
        email: string,
        contact: string,
    }

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}
export const TransactionSchema = SchemaFactory.createForClass(TransactionDocument)