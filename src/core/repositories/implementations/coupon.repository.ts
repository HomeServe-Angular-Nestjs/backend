import { ICoupon } from "@core/entities/interfaces/coupon.entity.interface";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { ICouponRepository } from "@core/repositories/interfaces/coupon-repo.interface";
import { CouponDocument } from "@core/schema/coupon.schema";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

@Injectable()
export class CouponRepository extends BaseRepository<CouponDocument> implements ICouponRepository {

    constructor(
        private readonly _couponModel: Model<CouponDocument>,
    ) { super(_couponModel) }


    async editCoupon(couponId: string, updateData: Partial<ICoupon>): Promise<CouponDocument | null> {
        return await this._couponModel.findOneAndUpdate(
            { _id: couponId },
            { $set: updateData },
            { new: true }
        )
    }
}