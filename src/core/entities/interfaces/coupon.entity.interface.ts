import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { DiscountTypeEnum, UsageTypeEnum } from "@core/enum/coupon.enum";

export interface ICoupon extends IEntity {
    couponCode: string;
    couponName: string;
    discountType: DiscountTypeEnum;
    usageType: UsageTypeEnum;
    discountValue: number;
    validFrom: Date | null;
    validTo: Date | null;
    usageLimit: number;
    isActive: boolean;
    isDeleted: boolean;
}