import { couponRepositoryProviders } from "@modules/coupons/providers/coupon-repository.provider";
import { couponServiceProviders } from "@modules/coupons/providers/coupon-service.providers";
import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";

@Module({
    imports: [SharedModule],
    controllers: [],
    providers: [
        ...couponServiceProviders,
        ...couponRepositoryProviders
    ],
})
export class CouponModule { }