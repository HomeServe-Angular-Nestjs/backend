import { Document, SchemaTypes } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
    PlanRoleType, RenewalType, SubsDurationType, SubsPaymentStatus
} from '../enum/subscription.enum';

@Schema({ timestamps: true })
export class SubscriptionDocument extends Document {
    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    transactionId: string;

    @Prop({ type: String, required: true })
    planId: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({
        type: String,
        required: true,
        enum: Object.values(SubsDurationType)
    })
    duration: SubsDurationType;

    @Prop({
        type: String,
        required: true,
        enum: Object.values(PlanRoleType)
    })
    role: PlanRoleType;

    @Prop({ type: [String], required: true })
    features: string[];

    @Prop({ type: Date, required: true })
    startTime: Date;

    @Prop({ type: Date, required: true, default: null })
    endDate: Date | null;

    @Prop({ type: Number, required: true, default: 0 })
    price: number;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({
        type: String,
        enum: Object.values(RenewalType),
        default: 'auto'
    })
    renewalType?: RenewalType;

    @Prop({
        type: String,
        enum: Object.values(SubsPaymentStatus)
    })
    paymentStatus?: SubsPaymentStatus;

    @Prop({ type: Date })
    cancelledAt?: Date;

    @Prop({ type: SchemaTypes.Mixed })
    metadata?: Record<string, any>;

    @Prop({ type: Date })
    createdAt?: Date;

    @Prop({ type: Date })
    updatedAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(SubscriptionDocument);