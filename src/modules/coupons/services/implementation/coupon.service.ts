import { COUPON_MAPPER } from "@core/constants/mappers.constant";
import { COUPON_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ICouponMapper } from "@core/dto-mapper/interface/coupon.mapper.interface";
import { ICoupon } from "@core/entities/interfaces/coupon.entity.interface";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { IResponse } from "@core/misc/response.util";
import { ICouponRepository } from "@core/repositories/interfaces/coupon-repo.interface";
import { CreateCouponDto, EditCouponDto } from "@modules/coupons/dtos/coupon.dto";
import { ICouponService } from "@modules/coupons/services/interface/coupon-service.interface";
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";

@Injectable()
export class CouponService implements ICouponService {
    constructor(
        @Inject(COUPON_MAPPER)
        private readonly _couponMapper: ICouponMapper,
        @Inject(COUPON_REPOSITORY_NAME)
        private readonly _couponRepository: ICouponRepository,
    ) { }


    async getAllCoupons(): Promise<IResponse<ICoupon[]>> {
        const couponDocs = await this._couponRepository.find({ isDeleted: false });
        const coupons = (couponDocs ?? []).map(coupon => this._couponMapper.toEntity(coupon));

        return {
            success: true,
            message: coupons.length > 0
                ? 'All coupons fetched successfully.'
                : 'No Coupon found.',
            data: coupons
        }
    }

    async createCoupon(adminId: string, createCouponDto: CreateCouponDto): Promise<IResponse<ICoupon>> {
        const newCoupon = this._couponMapper.toDocument({
            couponCode: 'createCouponDto.couponCode',
            couponName: createCouponDto.couponName,
            discountType: createCouponDto.discountType,
            usageType: createCouponDto.usageType,
            discountValue: createCouponDto.discountValue,
            validFrom: createCouponDto.validFrom ? new Date(createCouponDto.validFrom) : null,
            validTo: createCouponDto.validTo ? new Date(createCouponDto.validTo) : null,
            usageLimit: createCouponDto.usageLimit,
            isActive: true,
            isDeleted: false,
        });

        let coupon: ICoupon;
        try {
            const couponDoc = await this._couponRepository.create(newCoupon);
            if (!couponDoc) throw new InternalServerErrorException({
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                message: ErrorMessage.INTERNAL_SERVER_ERROR
            });
            coupon = this._couponMapper.toEntity(couponDoc);
        } catch (err) {
            throw err;
        }

        return {
            success: true,
            message: 'Coupon created successfully',
            data: coupon
        }
    }

    async editCoupon(editCouponDto: EditCouponDto): Promise<IResponse<ICoupon>> {
        const { couponId, ...couponData } = editCouponDto;

        const editCouponEntity = this._couponMapper.editCouponDtoToEntity(editCouponDto);
        const updatedCouponDoc = await this._couponRepository.editCoupon(couponId, editCouponEntity);

        if (!updatedCouponDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.COUPON_NOT_FOUND
        });

        const editedCoupon = this._couponMapper.toEntity(updatedCouponDoc);

        return {
            success: true,
            message: 'Coupon edited successfully.',
            data: editedCoupon
        }
    }

    async getOneCoupon(couponId: string): Promise<IResponse<ICoupon>> {
        const couponDoc = await this._couponRepository.findById(couponId);
        if (!couponDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.COUPON_NOT_FOUND
        });
        const coupon = this._couponMapper.toEntity(couponDoc);

        return {
            success: true,
            message: 'Coupon fetched successfully.',
            data: coupon
        }
    }
}