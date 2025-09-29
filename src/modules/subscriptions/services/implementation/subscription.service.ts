import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PLAN_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME } from '@/core/constants/repository.constant';
import { ISubscription } from '@/core/entities/interfaces/subscription.entity.interface';
import { ErrorCodes, ErrorMessage } from '@/core/enum/error.enum';
import { IResponse } from '@/core/misc/response.util';
import { IPlanRepository } from '@/core/repositories/interfaces/plans-repo.interface';
import { ISubscriptionRepository } from '@/core/repositories/interfaces/subscription-repo.interface';
import { CreateSubscriptionDto, IUpdatePaymentStatusDto } from '@modules/subscriptions/dto/subscription.dto';
import { ISubscriptionService } from '@modules/subscriptions/services/interface/subscription-service.interface';
import { PLAN_MAPPER, SUBSCRIPTION_MAPPER } from '@core/constants/mappers.constant';
import { ISubscriptionMapper } from '@core/dto-mapper/interface/subscription.mapper.interface';
import { IPlanMapper } from '@core/dto-mapper/interface/plan.mapper.interface';
import { UserType } from '@modules/auth/dtos/login.dto';
import { PlanRoleEnum } from '@core/enum/subscription.enum';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';

@Injectable()
export class SubscriptionService implements ISubscriptionService {

    constructor(
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository,
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository,
        @Inject(SUBSCRIPTION_MAPPER)
        private readonly _subscriptionMapper: ISubscriptionMapper,
        @Inject(PLAN_MAPPER)
        private readonly _planMapper: IPlanMapper,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
    ) { }

    private async _isUpdatedUserSubscriptionStatus(userId: string, userType: string, subscriptionId: string): Promise<boolean> {
        let isUpdated: boolean = false;

        if (userType === 'customer') {
            isUpdated = await this._customerRepository.updateSubscriptionId(userId, subscriptionId);
        } else if (userType === 'provider') {
            isUpdated = await this._providerRepository.updateSubscriptionId(userId, subscriptionId);
        }

        return isUpdated;
    }


    private _calculateUpgradeAmount(monthlyPrice: number, yearlyPrice: number, startDateStr: string): number {
        const startDate = new Date(startDateStr);
        const today = new Date();

        // Normalizing time to prevent partial-day errors
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const msInDay = 1000 * 60 * 60 * 24;
        const daysUsed = Math.floor((today.getTime() - startDate.getTime()) / msInDay);

        // within 7 days, subtract full monthly
        if (daysUsed < 7) {
            return yearlyPrice - monthlyPrice;
        }

        // after 7 days, subtract only unused portion
        const totalDaysInMonth = 30;
        const unusedDays = Math.max(totalDaysInMonth - daysUsed, 0);
        const perDayPrice = monthlyPrice / totalDaysInMonth;
        const creditAmount = unusedDays * perDayPrice;

        return Math.floor(yearlyPrice - creditAmount);
    }

    async createSubscription(userId: string, userType: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const isSubscriptionExists = await this._subscriptionRepository.findActiveSubscriptionByUserId(userId, userType);

        if (isSubscriptionExists) {
            throw new ConflictException(ErrorMessage.DOCUMENT_ALREADY_EXISTS);
        }

        const plan = await this._planRepository.findById(dto.planId);
        if (!plan) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        const newSubscription = await this._subscriptionRepository.create(
            this._subscriptionMapper.toDocument({
                userId,
                planId: dto.planId,
                transactionId: null,
                name: plan.name,
                role: dto.role,
                price: dto.price,
                duration: dto.duration,
                features: dto.features,
                startTime: new Date(dto.startTime),
                isActive: true,
                isDeleted: false,
                paymentStatus: dto.paymentStatus,
                cancelledAt: null,
                endDate: new Date()
            })
        );

        if (!newSubscription) {
            throw new InternalServerErrorException(ErrorMessage.DOCUMENT_CREATION_ERROR);
        }

        return {
            success: true,
            message: 'Subscription created successfully.',
            data: this._subscriptionMapper.toEntity(newSubscription)
        }
    }

    async fetchSubscription(userId: string, role: PlanRoleEnum): Promise<IResponse<ISubscription | null>> {
        const subscription = await this._subscriptionRepository.findSubscription(userId, role);

        if (!subscription) {
            return {
                success: false,
                message: 'User has not active subscription plans',
                data: null
            }
        }

        return {
            success: true,
            message: 'Subscription fetched successfully',
            data: this._subscriptionMapper.toEntity(subscription)
        }
    }

    async getUpgradeAmount(role: UserType, currentSubscriptionId: string): Promise<IResponse<number>> {
        const currentSubscriptionDocument = await this._subscriptionRepository.fetchCurrentActiveSubscription(currentSubscriptionId);

        if (!currentSubscriptionDocument) {
            throw new NotFoundException({
                code: ErrorCodes.NO_ACTIVE_SUBSCRIPTION,
                message: `${ErrorMessage.SUBSCRIPTION_NOT_FOUND}`
            });
        }

        const currentSubscription = this._subscriptionMapper.toEntity(currentSubscriptionDocument);

        if (currentSubscription.duration === 'yearly' || !currentSubscription.endDate) {
            throw new InternalServerErrorException('Requested subscription is not possible');
        }

        const yearlyPlanDocument = await this._planRepository.findOne({ role, duration: 'yearly' });
        if (!yearlyPlanDocument) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            messages: ErrorMessage.PLAN_NOT_FOUND
        });

        const yearlyPlan = this._planMapper.toEntity(yearlyPlanDocument);

        const yearlyPrice = yearlyPlan.price;
        const monthlyPrice = currentSubscription.price;

        const upgradeAmount = this._calculateUpgradeAmount(monthlyPrice, yearlyPrice, currentSubscription.startTime.toString());

        return {
            success: true,
            message: 'Subscription upgrade amount fetched.',
            data: upgradeAmount
        }
    }

    async upgradeSubscription(userId: string, userType: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const isSubscriptionExists = await this._subscriptionRepository.findActiveSubscriptionByUserId(userId, userType);
        if (!isSubscriptionExists) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'You are not subscribed to any plans. Please subscribe a plan to upgrade.'
            });
        }

        const plan = await this._planRepository.findById(dto.planId);
        if (!plan) {
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        const cancelled = await this._subscriptionRepository.cancelSubscriptionByUserId(userId, userType);
        if (!cancelled) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: 'Failed to cancel subscription.'
        });

        const newSubscription = await this._subscriptionRepository.create(
            this._subscriptionMapper.toDocument({
                userId,
                planId: dto.planId,
                transactionId: null,
                name: plan.name,
                role: dto.role,
                price: dto.price,
                duration: dto.duration,
                features: dto.features,
                startTime: new Date(),
                endDate: new Date(dto.endDate),
                isActive: true,
                isDeleted: false,
                paymentStatus: dto.paymentStatus,
                cancelledAt: null
            })
        );

        if (!newSubscription) {
            throw new InternalServerErrorException(ErrorMessage.DOCUMENT_CREATION_ERROR);
        }

        return {
            success: true,
            message: 'Subscription created successfully.',
            data: this._subscriptionMapper.toEntity(newSubscription)
        }
    }

    async updatePaymentStatus(userId: string, userType: string, data: IUpdatePaymentStatusDto): Promise<IResponse> {
        const subscriptionDoc = await this._subscriptionRepository.findSubscriptionById(data.subscriptionId);

        if (!subscriptionDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: `Subscription document not found.`
        });

        const subscription = this._subscriptionMapper.toEntity(subscriptionDoc);

        const updated = await this._subscriptionRepository.updatePaymentStatus(
            subscription.id,
            data.paymentStatus,
            data.transactionId
        );

        if (!updated) throw new NotFoundException({
            code: ErrorCodes.DATABASE_OPERATION_FAILED,
            message: `Failed to update subscription.`
        });

        const isUpdated = this._isUpdatedUserSubscriptionStatus(userId, userType, subscription.id);
        if (!isUpdated) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: 'Invalid user type.'
        });

        return {
            success: true,
            message: 'subscription updated successfully.'
        }
    }
}
