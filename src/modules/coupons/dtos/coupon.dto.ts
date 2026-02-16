import { DiscountTypeEnum, UsageTypeEnum } from "@core/enum/coupon.enum";
import { PageDto } from "@modules/providers/dtos/provider.dto";
import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpsertCouponDto {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    couponCode: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
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
    usageValue: number;

    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;

    @IsOptional()
    @IsString()
    professionId?: string;

    @IsOptional()
    @IsString()
    serviceCategoryId?: string;
}

export class CouponFilterDto extends PageDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value == 'all') return value;
        return value === 'true';
    })
    @IsIn([true, false, 'all'])
    isActive: boolean | 'all';

    @IsOptional()
    @IsIn([...Object.values(DiscountTypeEnum), 'all'])
    discountType: DiscountTypeEnum | 'all';

    @IsOptional()
    @IsIn([...Object.values(UsageTypeEnum), 'all'])
    usageType: UsageTypeEnum | 'all';

    @IsOptional()
    @IsString()
    professionId?: string;

    @IsOptional()
    @IsString()
    serviceCategoryId?: string;
}

export class ApplyCouponPayloadDto {
    @IsNotEmpty()
    @IsString()
    couponId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: "Total should be above 1." })
    total: number;
}