import { PROFESSION_MODEL_NAME, PROVIDER_MODEL_NAME, SERVICE_CATEGORY_MODEL_NAME } from "@core/constants/model.constant";
import { PricingUnitType } from "@core/entities/interfaces/provider-service.entity.interface";
import { ProfessionDocument } from "@core/schema/profession.schema";
import { ServiceCategoryDocument } from "@core/schema/service-category";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class ProviderServiceDocument extends Document {
    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: PROVIDER_MODEL_NAME
    })
    providerId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: PROFESSION_MODEL_NAME
    })
    professionId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: SERVICE_CATEGORY_MODEL_NAME
    })
    categoryId: Types.ObjectId;

    @Prop({ required: true })
    description: string;

    @Prop({
        type: Number,
        default: 0,
        required: true
    })
    price: Number;

    @Prop({
        type: String,
        required: true,
        enum: ['hour', 'day']
    })
    pricingUnit: PricingUnitType;

    @Prop({
        type: String,
        default: ''
    })
    image: string;

    @Prop({
        type: Number,
        required: true
    })
    estimatedTimeInMinutes: Number;

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

    @Prop({
        type: Date,
        default: Date.now
    })
    createdAt?: Date;

    @Prop({
        type: Date,
        default: Date.now
    })
    updatedAt?: Date;
}

export const ProviderServiceSchema = SchemaFactory.createForClass(ProviderServiceDocument);

export interface ProviderServicePopulatedDocument extends Omit<ProviderServiceDocument, 'professionId' | 'categoryId'> {
    professionId: ProfessionDocument;
    categoryId: ServiceCategoryDocument;
}
