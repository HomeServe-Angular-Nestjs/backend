import { DiscountTypeEnum, UsageTypeEnum } from "@core/enum/coupon.enum";
import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateCouponDto {
    @IsNotEmpty()
    @IsString()
    couponName: string;

    @IsString()
    @IsIn(Object.values(DiscountTypeEnum), { message: 'Invalid discount type.' })
    discountType: DiscountTypeEnum;

    @IsString()
    @IsIn(Object.values(UsageTypeEnum), { message: 'Invalid usage type.' })
    usageType: UsageTypeEnum;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: "Discount value should be above 1." })
    discountValue: number;

    @IsOptional()
    @IsISO8601({}, { message: 'validFrom must be a valid ISO 8601 date' })
    validFrom?: string;

    @IsOptional()
    @IsISO8601({}, { message: 'validTo must be a valid ISO 8601 date' })
    validTo?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: "Usage limit should be above 1." })
    usageLimit: number;
}

export class EditCouponDto extends PartialType(CreateCouponDto) {
    @IsNotEmpty()
    @IsString()
    couponId: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;
}