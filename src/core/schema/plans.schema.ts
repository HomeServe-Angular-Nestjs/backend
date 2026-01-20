import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PlanFeatures } from '../entities/interfaces/plans.entity.interface';
import { PlanDurationEnum, PlanRoleEnum } from '@core/enum/subscription.enum';

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
    })
    price: number;

    @Prop({
        type: String,
        enum: Object.values(PlanDurationEnum),
        required: true
    })
    duration: PlanDurationEnum;

    @Prop({
        type: String,
        enum: Object.values(PlanRoleEnum),
        required: true
    })
    role: PlanRoleEnum;

    @Prop({
        type: Object,
        required: true
    })
    features: PlanFeatures;

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
PlanSchema.index({ name: 1, role: 1 }, { unique: true });
