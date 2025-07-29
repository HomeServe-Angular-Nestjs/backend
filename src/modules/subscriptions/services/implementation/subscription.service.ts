import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { PLAN_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME } from '@/core/constants/repository.constant';
import { ISubscription } from '@/core/entities/interfaces/subscription.entity.interface';
import { ErrorMessage } from '@/core/enum/error.enum';
import { IResponse } from '@/core/misc/response.util';
import { IPlanRepository } from '@/core/repositories/interfaces/plans-repo.interface';
import { ISubscriptionRepository } from '@/core/repositories/interfaces/subscription-repo.interface';
import { CreateSubscriptionDto } from '@modules/subscriptions/dto/subscription.dto';
import { ISubscriptionService } from '@modules/subscriptions/services/interface/subscription-service.interface';
import { PLAN_MAPPER, SUBSCRIPTION_MAPPER } from '@core/constants/mappers.constant';
import { ISubscriptionMapper } from '@core/dto-mapper/interface/subscription.mapper.interface';
import { IPlanMapper } from '@core/dto-mapper/interface/plan.mapper.interface';
import { UserType } from '@modules/auth/dtos/login.dto';
import { Types } from 'mongoose';

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
        private readonly _planMapper: IPlanMapper
    ) { }

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

    async createSubscription(userId: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const isSubscriptionExists = await this._subscriptionRepository.findOne({
            userId,
            isActive: true
        });

        if (isSubscriptionExists) {
            throw new ConflictException(ErrorMessage.DOCUMENT_ALREADY_EXISTS);
        }
        console.log(isSubscriptionExists);
        console.log(userId);
        const plan = await this._planRepository.findById(dto.planId);
        if (!plan) {
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        const newSubscription = await this._subscriptionRepository.create({
            userId,
            planId: dto.planId,
            transactionId: dto.transactionId,
            name: plan.name,
            role: dto.role, 
            price: dto.price,
            duration: dto.duration,
            features: dto.features,
            startTime: new Date(dto.startTime),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            isActive: true,
            isDeleted: false,
            paymentStatus: dto.paymentStatus,
        });

        if (!newSubscription) {
            throw new InternalServerErrorException(ErrorMessage.DOCUMENT_CREATION_ERROR);
        }

        return {
            success: true,
            message: 'Subscription created successfully.',
            data: this._subscriptionMapper.toEntity(newSubscription)
        }
    }

    async fetchSubscription(userId: string): Promise<IResponse<ISubscription | null>> {
        const subscription = await this._subscriptionRepository.findOne({ userId });

        if (!subscription) {
            return {
                success: false,
                message: 'Subscription fetched successfully',
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
        const currentSubscriptionDocument = await this._subscriptionRepository.findById(currentSubscriptionId);
        if (!currentSubscriptionDocument) {
            throw new NotFoundException(ErrorMessage.SUBSCRIPTION_NOT_FOUND, currentSubscriptionId);
        }

        const currentSubscription = this._subscriptionMapper.toEntity(currentSubscriptionDocument);

        if (currentSubscription.duration === 'yearly' || !currentSubscription.endDate) {
            throw new InternalServerErrorException('Requested subscription is not possible');
        }

        const yearlyPlanDocument = await this._planRepository.findOne({ role, duration: 'yearly' });
        if (!yearlyPlanDocument) {
            throw new NotFoundException(ErrorMessage.PLAN_NOT_FOUND);
        }
        const yearlyPlan = this._planMapper.toEntity(yearlyPlanDocument);

        const yearlyPrice = yearlyPlan.price;
        const monthlyPrice = currentSubscription.price;

        const upgradeAmount = this._calculateUpgradeAmount(monthlyPrice, yearlyPrice, currentSubscription.startTime);

        return {
            success: true,
            message: 'Subscription upgrade amount fetched.',
            data: upgradeAmount
        }
    }

    async upgradeSubscription(userId: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const now = new Date();

        const updatedSubscription = await this._subscriptionRepository.findOneAndUpdate(
            { userId },
            { $set: { isActive: false, cancelledAt: now } },
            { new: true }
        );

        if (updatedSubscription) {
            throw new ConflictException(ErrorMessage.DOCUMENT_ALREADY_EXISTS);
        }

        const plan = await this._planRepository.findById(dto.planId);
        if (!plan) {
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        const newSubscription = await this._subscriptionRepository.create({
            userId,
            planId: dto.planId,
            transactionId: dto.transactionId,
            name: plan.name,
            role: dto.role,
            price: dto.price,
            duration: dto.duration,
            features: dto.features,
            startTime: now,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            isActive: true,
            isDeleted: false,
            paymentStatus: dto.paymentStatus,
        });

        if (!newSubscription) {
            throw new InternalServerErrorException(ErrorMessage.DOCUMENT_CREATION_ERROR);
        }

        return {
            success: true,
            message: 'Subscription created successfully.',
            data: this._subscriptionMapper.toEntity(newSubscription)
        }
    }
}
