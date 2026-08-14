import type { ICoupon } from '@core/entities/interfaces/coupon.entity.interface';
import type { CouponDocument } from '@core/schema/coupon.schema';
import type { UpsertCouponDto } from '@modules/coupons/dtos/coupon.dto';

export interface ICouponMapper {
  toDocument(entity: Omit<ICoupon, 'id'>): Partial<CouponDocument>;
  toEntity(doc: CouponDocument): ICoupon;
  editCouponDtoToEntity(couponDto: UpsertCouponDto): Partial<ICoupon>;
}
