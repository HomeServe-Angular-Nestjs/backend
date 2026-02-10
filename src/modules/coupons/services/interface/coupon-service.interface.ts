import { ICoupon } from "@core/entities/interfaces/coupon.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { CreateCouponDto, EditCouponDto } from "@modules/coupons/dtos/coupon.dto";

export interface ICouponService {
    getAllCoupons(): Promise<IResponse<ICoupon[]>>
    createCoupon(adminId: string, createCouponDto: CreateCouponDto): Promise<IResponse<ICoupon>>;
    editCoupon(editCouponDto: EditCouponDto): Promise<IResponse<ICoupon>>;
    getOneCoupon(couponId: string): Promise<IResponse<ICoupon>>;
}