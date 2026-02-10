import { COUPON_SERVICE_NAME } from "@core/constants/service.constant";
import { User } from "@core/decorators/extract-user.decorator";
import { ICoupon, ICouponWithPagination } from "@core/entities/interfaces/coupon.entity.interface";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { isValidIdPipe } from "@core/pipes/is-valid-id.pipe";
import { CouponFilterDto, CreateCouponDto, EditCouponDto } from "@modules/coupons/dtos/coupon.dto";
import { ICouponService } from "@modules/coupons/services/interface/coupon-service.interface";
import { Body, Controller, Get, Inject, Param, Post, Put, Query } from "@nestjs/common";

@Controller('coupon')
export class CouponController {
    constructor(
        @Inject(COUPON_SERVICE_NAME)
        private readonly _couponService: ICouponService,
    ) { }

    @Get('')
    async getAllCoupons(@Query() couponFilterDto: CouponFilterDto): Promise<IResponse<ICouponWithPagination>> {
        return this._couponService.getAllCoupons(couponFilterDto);
    }

    @Get('one/:id')
    async getOneCoupons(@Param('id', new isValidIdPipe()) couponId: string): Promise<IResponse<ICoupon>> {
        return this._couponService.getOneCoupon(couponId);
    }

    @Post('')
    async createCoupon(@User() user: IPayload, @Body() createCouponDto: CreateCouponDto): Promise<IResponse<ICoupon>> {
        return this._couponService.createCoupon(user.sub, createCouponDto);
    }

    @Put('')
    async editCoupon(@Body() editCouponDto: EditCouponDto): Promise<IResponse<ICoupon>> {
        return this._couponService.editCoupon(editCouponDto);
    }
}