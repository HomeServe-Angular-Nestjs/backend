import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { IPagination } from "@core/entities/interfaces/booking.entity.interface";
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

export interface ICouponFilter {
    search: string;
    isActive: boolean | 'all',
    discountType: DiscountTypeEnum | 'all',
    usageType: UsageTypeEnum | 'all',
}

export interface ICouponWithPagination {
    coupons: ICoupon[];
    pagination: IPagination;
}