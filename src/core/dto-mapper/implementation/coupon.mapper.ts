import { ICouponMapper } from "@core/dto-mapper/interface/coupon.mapper.interface";
import { Coupon } from "@core/entities/implementation/coupon.entity";
import { ICoupon } from "@core/entities/interfaces/coupon.entity.interface";
import { CouponDocument } from "@core/schema/coupon.schema";
import { UpsertCouponDto } from "@modules/coupons/dtos/coupon.dto";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class CouponMapper implements ICouponMapper {

    toDocument(entity: Omit<ICoupon, "id">): Partial<CouponDocument> {
        return {
            couponCode: entity.couponCode,
            couponName: entity.couponName,
            discountType: entity.discountType,
            usageType: entity.usageType,
            discountValue: entity.discountValue,
            validFrom: entity.validFrom,
            validTo: entity.validTo,
            usageValue: entity.usageValue,
            isActive: entity.isActive,
            isDeleted: entity.isDeleted,
        };
    }

    toEntity(doc: CouponDocument): ICoupon {
        return new Coupon({
            id: (doc._id as Types.ObjectId).toString(),
            couponCode: doc.couponCode,
            couponName: doc.couponName,
            discountType: doc.discountType,
            usageType: doc.usageType,
            discountValue: doc.discountValue,
            validFrom: doc.validFrom,
            validTo: doc.validTo,
            usageValue: doc.usageValue,
            isActive: doc.isActive,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    editCouponDtoToEntity(couponDto: UpsertCouponDto): Partial<ICoupon> {
        return new Coupon({
            couponName: couponDto.couponName,
            discountType: couponDto.discountType,
            usageType: couponDto.usageType,
            discountValue: couponDto.discountValue,
            validFrom: couponDto.validFrom ? new Date(couponDto.validFrom) : null,
            validTo: couponDto.validTo ? new Date(couponDto.validTo) : null,
            usageValue: couponDto.usageValue,
            isActive: couponDto.isActive,
        });
    }
}