import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { ICoupon } from "@core/entities/interfaces/coupon.entity.interface";
import { DiscountTypeEnum, UsageTypeEnum } from "@core/enum/coupon.enum";

export class Coupon extends BaseEntity implements ICoupon {
    couponCode: string;
    couponName: string;
    discountType: DiscountTypeEnum;
    usageType: UsageTypeEnum;
    discountValue: number;
    validFrom: Date | null;
    validTo: Date | null;
    usageValue: number;
    isActive: boolean;
    isDeleted: boolean;
    professionId: string | null;
    serviceCategoryId: string | null;

    constructor(partial: Partial<ICoupon>) {
        super(partial);
        Object.assign(this, partial);
    }
}