import { ICoupon, ICouponFilter } from "@core/entities/interfaces/coupon.entity.interface";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { CouponDocument } from "@core/schema/coupon.schema";

export interface ICouponRepository extends IBaseRepository<CouponDocument> {
    fetchCouponsWithFilterAndPagination(couponFilter: ICouponFilter, option: { page: number, limit: number }): Promise<CouponDocument[]>;
    editCoupon(couponId: string, updateData: Partial<Omit<ICoupon, 'id'>>): Promise<CouponDocument | null>;
    countCoupons(): Promise<number>;
}