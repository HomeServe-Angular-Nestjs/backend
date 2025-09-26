import { Document, model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PlanDurationType } from '../entities/interfaces/plans.entity.interface';
import { PlanRoleEnum } from '@core/enum/subscription.enum';

@Schema({ timestamps: true })
export class PlanDocument extends Document {
    @Prop({
        type: String,
        required: true,
    })
    name: string;

    @Prop({
        type: Number,
        required: true,
        default: 0
    })
    price: number;

    @Prop({
        type: String,
        enum: ['monthly', 'yearly', 'lifetime'],
        required: true
    })
    duration: PlanDurationType;

    @Prop({
        type: String,
        enum: Object.values(PlanRoleEnum),
        required: true
    })
    role: PlanRoleEnum;

    @Prop({
        type: [String],
        required: true,
    })
    features: string[];

    @Prop({
        type: Boolean,
        default: true
    })
    isActive: boolean;

    @Prop({
        type: Boolean,
        default: false
    })
    isDeleted: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const PlanSchema = SchemaFactory.createForClass(PlanDocument);
