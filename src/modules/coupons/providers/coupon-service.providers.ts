import { COUPON_SERVICE_NAME } from "@core/constants/service.constant";
import { CouponService } from "@modules/coupons/services/implementation/coupon.service";
import { Provider } from "@nestjs/common";

export const couponServiceProviders: Provider[] = [
    {
        provide: COUPON_SERVICE_NAME,
        useClass: CouponService
    },
]