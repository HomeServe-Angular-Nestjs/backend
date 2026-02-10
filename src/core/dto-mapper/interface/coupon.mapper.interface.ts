import { ICoupon } from "@core/entities/interfaces/coupon.entity.interface";
import { CouponDocument } from "@core/schema/coupon.schema";
import { EditCouponDto } from "@modules/coupons/dtos/coupon.dto";

export interface ICouponMapper {
    toDocument(entity: Omit<ICoupon, 'id'>): Partial<CouponDocument>;
    toEntity(doc: CouponDocument): ICoupon;
    editCouponDtoToEntity(couponDto: EditCouponDto): Partial<ICoupon>;
}