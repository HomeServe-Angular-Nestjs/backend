import { DiscountTypeEnum, UsageTypeEnum } from "@core/enum/coupon.enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class CouponDocument extends Document {
    @Prop({
        type: String,
        required: true,
        unique: true,
        index: true
    })
    couponCode: string;

    @Prop({
        type: String,
        required: true,
    })
    couponName: string;

    @Prop({
        type: String,
        required: true,
        enum: Object.values(DiscountTypeEnum)
    })
    discountType: DiscountTypeEnum;

    @Prop({
        type: String,
        required: true,
        enum: Object.values(UsageTypeEnum)
    })
    usageType: UsageTypeEnum;

    @Prop({
        type: Number,
        required: true,
        min: 1
    })
    discountValue: number;

    @Prop({ type: Date })
    validFrom: Date | null;

    @Prop({ type: Date })
    validTo: Date | null;

    @Prop({
        type: Number,
        required: true,
        min: 1
    })
    usageLimit: number;

    @Prop({
        type: Boolean,
        default: true
    })
    isActive: boolean;

    @Prop({
        type: Boolean,
        default: true
    })
    isDeleted: boolean;

    @Prop({ type: Date })
    createdAt?: Date;

    @Prop({ type: Date })
    updatedAt?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(CouponDocument);
