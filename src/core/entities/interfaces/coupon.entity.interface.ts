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
    usageValue: number;
    isActive: boolean;
    isDeleted: boolean;
    professionId: string | null;
    serviceCategoryId?: string | null;
}

export interface ICouponFilter {
    search: string;
    isActive: boolean | 'all',
    discountType: DiscountTypeEnum | 'all',
    usageType: UsageTypeEnum | 'all',
    professionId?: string;
    serviceCategoryId?: string;
}

export interface ICouponWithPagination {
    coupons: ICouponTableData[];
    pagination: IPagination;
}

export interface ICouponAppliedResponse {
    originalAmount: number;
    discountType: DiscountTypeEnum;
    couponValue: number;
    deductedValue: number;
    finalAmount: number;
}

export interface ICouponTableData extends ICoupon {
    professionName?: string;
    categoryServiceName?: string;
}