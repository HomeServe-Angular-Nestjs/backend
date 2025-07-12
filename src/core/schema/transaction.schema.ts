import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { TransactionStatus, TransactionType } from "../enum/transaction.enum";

@Schema({ timestamps: true })
export class TransactionDocument extends Document {
    @Prop({
        type: String,
        required: true
    })
    userId: string;

    @Prop({
        type: String,
        required: true
    })
    orderId: string;

    @Prop({
        type: String,
        default: null
    })
    paymentId: string;

    @Prop({
        type: String,
        default: null
    })
    signature: string;

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
        type: String,
        enum: Object.values(TransactionStatus),
        default: 'created'
    })
    status: TransactionStatus;

    @Prop({
        type: String,
        default: null
    })
    method: string;

    @Prop({ type: String })
    email: string;

    @Prop({ type: String })
    contact: string;

    @Prop({
        type: String,
        default: null
    })
    receipt: string;

    @Prop({
        type: String,
        required: true,
        enum: Object.values(TransactionType)
    })
    transactionType: TransactionType

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(TransactionDocument)