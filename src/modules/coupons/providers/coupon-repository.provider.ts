import { COUPON_MODEL_NAME } from "@core/constants/model.constant";
import { COUPON_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { CouponRepository } from "@core/repositories/implementations/coupon.repository";
import { CouponDocument } from "@core/schema/coupon.schema";
import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

export const couponRepositoryProviders: Provider[] = [
    {
        provide: COUPON_REPOSITORY_NAME,
        useFactory: (couponModel: Model<CouponDocument>) =>
            new CouponRepository(couponModel),
        inject: [getModelToken(COUPON_MODEL_NAME)]
    }
];