import { ICoupon, ICouponFilter } from "@core/entities/interfaces/coupon.entity.interface";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { ICouponRepository } from "@core/repositories/interfaces/coupon-repo.interface";
import { CouponDocument } from "@core/schema/coupon.schema";
import { Injectable } from "@nestjs/common";
import { match } from "assert";
import { FilterQuery, Model } from "mongoose";

@Injectable()
export class CouponRepository extends BaseRepository<CouponDocument> implements ICouponRepository {

    constructor(
        private readonly _couponModel: Model<CouponDocument>,
    ) { super(_couponModel) }

    async fetchCouponsWithFilterAndPagination(couponFilter: ICouponFilter, option: { page: number; limit: number; }): Promise<CouponDocument[]> {
        const page = option.page ?? 1;
        const limit = option.limit ?? 10;
        const skip = (page - 1) * limit;

        const matchQuery: FilterQuery<CouponDocument> = { isDeleted: false };

        if (couponFilter.search?.trim()) {
            matchQuery.$or = [
                { couponName: { $regex: couponFilter.search, $options: 'i' } },
                { couponCode: { $regex: couponFilter.search, $options: 'i' } },
            ]
        }

        if (couponFilter.isActive !== 'all') {
            matchQuery.isActive = couponFilter.isActive;
        }

        if (couponFilter.discountType !== 'all') {
            matchQuery.discountType = couponFilter.discountType;
        }

        if (couponFilter.usageType !== 'all') {
            matchQuery.usageType = couponFilter.usageType;
        }

        if (couponFilter.professionId) {
            matchQuery.professionId = couponFilter.professionId;
        }

        if (couponFilter.serviceCategoryId) {
            matchQuery.serviceCategoryId = couponFilter.serviceCategoryId;
        }

        return await this._couponModel
            .find(matchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async editCoupon(couponId: string, updateData: Partial<ICoupon>): Promise<CouponDocument | null> {
        return await this._couponModel.findOneAndUpdate(
            { _id: couponId },
            { $set: updateData },
            { new: true }
        )
    }

    async countCoupons(): Promise<number> {
        return await this._couponModel.countDocuments({ isDeleted: false });
    }

    async deleteCouponById(couponId: string): Promise<boolean> {
        const result = await this._couponModel.deleteOne({ _id: couponId });
        return result.deletedCount > 0;
    }

    async toggleStatusById(couponId: string): Promise<boolean> {
        const result = await this._couponModel.updateOne(
            { _id: couponId },
            [{ $set: { isActive: { $not: "$isActive" } } }]
        );
        return result.modifiedCount > 0;
    }

    async findAvailableCoupons(): Promise<CouponDocument[]> {
        return await this._couponModel.find({ isDeleted: false, isActive: true }).lean();
    }
}