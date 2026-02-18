import { COUPON_MAPPER } from "@core/constants/mappers.constant";
import { COUPON_REPOSITORY_NAME, PROFESSION_REPOSITORY_NAME, SERVICE_CATEGORY_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ICouponMapper } from "@core/dto-mapper/interface/coupon.mapper.interface";
import { ICoupon, ICouponAppliedResponse, ICouponFilter, ICouponTableData, ICouponWithPagination } from "@core/entities/interfaces/coupon.entity.interface";
import { DiscountTypeEnum, UsageTypeEnum } from "@core/enum/coupon.enum";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { IResponse } from "@core/misc/response.util";
import { ICouponRepository } from "@core/repositories/interfaces/coupon-repo.interface";
import { IProfessionRepository } from "@core/repositories/interfaces/profession-repo.interface";
import { IServiceCategoryRepository } from "@core/repositories/interfaces/service-category-repo.interface";
import { ApplyCouponPayloadDto, CouponFilterDto, UpsertCouponDto } from "@modules/coupons/dtos/coupon.dto";
import { ICouponService } from "@modules/coupons/services/interface/coupon-service.interface";
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { randomBytes } from "node:crypto";

@Injectable()
export class CouponService implements ICouponService {
    constructor(
        @Inject(COUPON_MAPPER)
        private readonly _couponMapper: ICouponMapper,
        @Inject(COUPON_REPOSITORY_NAME)
        private readonly _couponRepository: ICouponRepository,
        @Inject(PROFESSION_REPOSITORY_NAME)
        private readonly _professionRepository: IProfessionRepository,
        @Inject(SERVICE_CATEGORY_REPOSITORY_NAME)
        private readonly _serviceCategoryRepository: IServiceCategoryRepository,
    ) { }


    async getAllCoupons(couponFilterDto: CouponFilterDto): Promise<IResponse<ICouponWithPagination>> {
        const { page, limit, ...couponFilter } = couponFilterDto;

        const [couponDocs, totalCoupons] = await Promise.all([
            this._couponRepository.fetchCouponsWithFilterAndPagination(couponFilter, { page, limit }),
            this._couponRepository.countCoupons()
        ]);

        const coupons: ICouponTableData[] = await Promise.all(
            (couponDocs ?? []).map(async (coupon) => {
                const mappedCoupons = this._couponMapper.toEntity(coupon);

                let professionName = '';
                let categoryServiceName = '';

                if (coupon.professionId) {
                    const professionDoc = await this._professionRepository.findById(coupon.professionId.toString());
                    professionName = professionDoc?.name ?? '';
                }

                if (coupon.serviceCategoryId) {
                    const serviceCategoryDoc = await this._serviceCategoryRepository.findById(coupon.serviceCategoryId.toString());
                    categoryServiceName = serviceCategoryDoc?.name ?? '';
                }

                return {
                    ...mappedCoupons,
                    professionName,
                    categoryServiceName
                };
            })
        );

        return {
            success: true,
            message: coupons.length > 0
                ? 'All coupons fetched successfully.'
                : 'No Coupons found.',
            data: {
                coupons,
                pagination: {
                    total: totalCoupons,
                    page,
                    limit,
                }
            }
        }
    }

    async createCoupon(createCouponDto: UpsertCouponDto): Promise<IResponse<ICoupon>> {
        const newCoupon = this._couponMapper.toDocument({
            couponCode: createCouponDto.couponCode,
            couponName: createCouponDto.couponName,
            discountType: createCouponDto.discountType,
            usageType: createCouponDto.usageType,
            discountValue: createCouponDto.discountValue,
            validFrom: createCouponDto.validFrom ? new Date(createCouponDto.validFrom) : null,
            validTo: createCouponDto.validTo ? new Date(createCouponDto.validTo) : null,
            usageValue: createCouponDto.usageValue,
            isActive: createCouponDto.isActive,
            isDeleted: false,
            professionId: createCouponDto.professionId ?? null,
            serviceCategoryId: createCouponDto.serviceCategoryId ?? null,
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

    async editCoupon(couponId: string, editCouponDto: UpsertCouponDto): Promise<IResponse<ICoupon>> {
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

    async generateCode(): Promise<IResponse<string>> {
        const str = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const length = 6;
        const bytes = randomBytes(length);
        let result = '';

        for (let i = 0; i < length; i++) {
            result += str[bytes[i] % str.length];
        }

        return {
            success: true,
            message: 'Coupon code generated.',
            data: result
        }
    }

    async deleteCoupon(couponId: string): Promise<IResponse> {
        const isDeleted = await this._couponRepository.deleteCouponById(couponId);
        return {
            success: isDeleted,
            message: isDeleted ? 'Successfully deleted.' : 'Failed to delete.'
        }
    }

    async toggleStatus(couponId: string): Promise<IResponse> {
        const isUpdated = await this._couponRepository.toggleStatusById(couponId);
        return {
            success: isUpdated,
            message: isUpdated ? 'Successfully updated.' : 'Failed to update.'
        }
    }

    async getAvailableCoupons(): Promise<IResponse<ICoupon[]>> {
        const couponDocs = await this._couponRepository.findAvailableCoupons();
        const coupons = (couponDocs ?? [])
            .filter(coupon => {
                if (coupon.usageType === UsageTypeEnum.Expiry
                    && coupon.validTo
                    && !this._isCouponExpired(coupon.validTo)
                ) return true;
                return false;
            })
            .map(coupon => this._couponMapper.toEntity(coupon));
        return {
            success: true,
            message: 'All available coupons fetched successfully',
            data: coupons
        }
    }

    async applyCoupon(applyCouponPayload: ApplyCouponPayloadDto): Promise<IResponse<ICouponAppliedResponse>> {
        const { couponId, total } = applyCouponPayload;

        const couponDoc = await this._couponRepository.findById(couponId);
        if (!couponDoc) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: 'This coupon is not available.'
        });

        const coupon = this._couponMapper.toEntity(couponDoc);

        if (coupon.usageType === UsageTypeEnum.Expiry
            && coupon.validTo
            && this._isCouponExpired(coupon.validTo)
        ) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'This coupon has expired.'
            });
        }

        let discountAmount = 0;

        if (coupon.discountType === DiscountTypeEnum.Flat) {
            discountAmount = coupon.discountValue;
        }

        if (coupon.discountType === DiscountTypeEnum.Percentage) {
            discountAmount = (total * coupon.discountValue) / 100;
        }

        if (discountAmount > total) {
            discountAmount = total;
        }

        discountAmount = Number(discountAmount.toFixed(2));
        const finalAmount = Number((total - discountAmount).toFixed(2));

        // const threshold = 20; // 20%
        // if (this._isBelowAllowedPercentage(total, finalAmount, threshold)) {
        //     throw new BadRequestException({
        //         code: ErrorCodes.BAD_REQUEST,
        //         message: `Final amount cannot be below ${threshold}% of original total.`
        //     });
        // }

        return {
            success: true,
            message: 'Coupon applied successfully.',
            data: {
                originalAmount: total,
                discountType: coupon.discountType,
                couponValue: coupon.discountValue,
                deductedValue: discountAmount,
                finalAmount: finalAmount
            }
        }
    }

    private _isCouponExpired(endDate: Date | string): boolean {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const target = new Date(endDate);
        target.setUTCHours(0, 0, 0, 0);

        return today.getTime() > target.getTime();
    }

    private _isBelowAllowedPercentage(originalTotal: number, finalAmount: number, thresholdPercent: number): boolean {
        if (originalTotal <= 0) return false;
        const percentageRemaining = (finalAmount / originalTotal) * 100;
        return percentageRemaining < thresholdPercent;
    }
}