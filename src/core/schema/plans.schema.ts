import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, model } from "mongoose";
import { PlanDurationType, PlanRoleType } from "../entities/interfaces/plans.entity.interface";

export type PlanDocumentType = PlanDocument & Document;

@Schema({ timestamps: true })
export class PlanDocument {
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
        enum: ['customer', 'provider'],
        required: true
    })
    role: PlanRoleType;

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
