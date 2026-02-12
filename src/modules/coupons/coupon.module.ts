import { couponRepositoryProviders } from "@modules/coupons/providers/coupon-repository.provider";
import { couponServiceProviders } from "@modules/coupons/providers/coupon-service.providers";
import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";
import { CouponController } from "./controllers/coupon.controller";

@Module({
    imports: [SharedModule],
    controllers: [CouponController],
    providers: [
        ...couponServiceProviders,
        ...couponRepositoryProviders
    ],
})
export class CouponModule { }