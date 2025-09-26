import { Document, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PlanRoleEnum, RenewalEnum, SubsDurationType } from '@core/enum/subscription.enum';
import { PaymentStatus } from '@core/enum/bookings.enum';

@Schema({ timestamps: true })
export class SubscriptionDocument extends Document {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, default: null })
    transactionId: Types.ObjectId | null; 

    @Prop({ type: Types.ObjectId, required: true })
    planId: Types.ObjectId;

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
        enum: Object.values(PlanRoleEnum)
    })
    role: PlanRoleEnum;

    @Prop({ type: [String], required: true })
    features: string[];

    @Prop({ type: Date, required: true })
    startTime: Date;

    @Prop({ type: Date, required: true })
    endDate: Date;

    @Prop({ type: Number, required: true, default: 0 })
    price: number;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({
        type: String,
        enum: Object.values(RenewalEnum),
        default: RenewalEnum.Manual
    })
    renewalType?: RenewalEnum;

    @Prop({
        type: String,
        enum: Object.values(PaymentStatus)
    })
    paymentStatus: PaymentStatus;

    @Prop({ type: Date })
    cancelledAt: Date | null;

    @Prop({ type: SchemaTypes.Mixed })
    metadata?: Record<string, any>;

    @Prop({ type: Date })
    createdAt?: Date;

    @Prop({ type: Date })
    updatedAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(SubscriptionDocument);