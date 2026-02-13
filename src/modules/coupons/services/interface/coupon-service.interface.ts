import { ICoupon, ICouponWithPagination } from "@core/entities/interfaces/coupon.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { CouponFilterDto, UpsertCouponDto } from "@modules/coupons/dtos/coupon.dto";

export interface ICouponService {
    getAllCoupons(couponFilterDto: CouponFilterDto): Promise<IResponse<ICouponWithPagination>>
    createCoupon(createCouponDto: UpsertCouponDto): Promise<IResponse<ICoupon>>;
    editCoupon(couponId: string, editCouponDto: UpsertCouponDto): Promise<IResponse<ICoupon>>;
    getOneCoupon(couponId: string): Promise<IResponse<ICoupon>>;
    generateCode(): Promise<IResponse<string>>;
    deleteCoupon(couponId: string): Promise<IResponse>;
    toggleStatus(couponId: string): Promise<IResponse>;
    getAvailableCoupons(): Promise<IResponse<ICoupon[]>>;
}