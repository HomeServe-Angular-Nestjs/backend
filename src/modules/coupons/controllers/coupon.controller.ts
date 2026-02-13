import { COUPON_SERVICE_NAME } from "@core/constants/service.constant";
import { User } from "@core/decorators/extract-user.decorator";
import { ICoupon, ICouponWithPagination } from "@core/entities/interfaces/coupon.entity.interface";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { isValidIdPipe } from "@core/pipes/is-valid-id.pipe";
import { CouponFilterDto, UpsertCouponDto } from "@modules/coupons/dtos/coupon.dto";
import { ICouponService } from "@modules/coupons/services/interface/coupon-service.interface";
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query } from "@nestjs/common";

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

    @Get('code')
    async generateCode(): Promise<IResponse<string>> {
        return this._couponService.generateCode();
    }

    @Get('available')
    async getAvailableCoupons(): Promise<IResponse<ICoupon[]>> {
        return this._couponService.getAvailableCoupons();
    }

    @Post('')
    async createCoupon(@Body() createCouponDto: UpsertCouponDto): Promise<IResponse<ICoupon>> {
        return this._couponService.createCoupon(createCouponDto);
    }

    @Patch('/:id/status')
    async toggleStatus(@Param('id', new isValidIdPipe()) couponId: string): Promise<IResponse> {
        return this._couponService.toggleStatus(couponId);
    }

    @Get('/:id')
    async getOneCoupons(@Param('id', new isValidIdPipe()) couponId: string): Promise<IResponse<ICoupon>> {
        return this._couponService.getOneCoupon(couponId);
    }

    @Delete('/:id')
    async deleteCoupon(@Param('id', new isValidIdPipe()) couponId: string): Promise<IResponse> {
        return this._couponService.deleteCoupon(couponId);
    }

    @Put('/:id')
    async editCoupon(@Param('id', new isValidIdPipe()) couponId: string, @Body() editCouponDto: UpsertCouponDto): Promise<IResponse<ICoupon>> {
        return this._couponService.editCoupon(couponId, editCouponDto);
    }
}