import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

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
    amount: string;

    @Prop({
        type: String,
        default: 'INR'
    })
    currency: string;

    @Prop({
        type: String,
        enum: ['created', 'attempted', 'paid', 'failed', 'refunded'],
        default: 'created'
    })
    status: string;

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

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(TransactionDocument)